from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime, timedelta
import mysql.connector
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LaundryAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "laundryai"),
}

def get_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()

# ── Models ──────────────────────────────────────────────
class UserCreate(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    password: str
    email: str
    phone: str

class UserLogin(BaseModel):
    user_id: str
    password: str

class ReservationCreate(BaseModel):
    user_id: str
    machine_id: int
    day: str          # "Today" or "Tomorrow"
    starting_time: str  # "08:00:00"
    ending_time: str
    duration: int

class PaymentCreate(BaseModel):
    user_id: str
    card_holder_name: str
    card_number: str
    security_code: str
    expiry_date: str
    amount: float
    reservation_id: int

# ── Auth ─────────────────────────────────────────────────
@app.post("/api/signup")
def signup(user: UserCreate, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()
        cursor.execute(
            "INSERT INTO User (User_ID, FirstName, LastName, Password, Email, Phone) VALUES (%s,%s,%s,%s,%s,%s)",
            (user.user_id, user.first_name, user.last_name, hashed_pw, user.email, user.phone)
        )
        conn.commit()
        return {"success": True, "message": "Account created successfully"}
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code=400, detail="User ID already exists")
    finally:
        cursor.close()

@app.post("/api/login")
def login(creds: UserLogin, conn=Depends(get_db)):
    cursor = conn.cursor(dictionary=True)
    try:
        hashed_pw = hashlib.sha256(creds.password.encode()).hexdigest()
        cursor.execute(
            "SELECT User_ID, FirstName, LastName, Email, Phone FROM User WHERE User_ID=%s AND Password=%s",
            (creds.user_id, hashed_pw)
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"success": True, "user": user}
    finally:
        cursor.close()

# ── Machines ─────────────────────────────────────────────
@app.get("/api/machines")
def get_machines(conn=Depends(get_db)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT m.Machine_ID, m.Status, m.Remaining_Time, m.Floor, m.Type,
                   r.User_ID as booked_by
            FROM Laundry_Machine m
            LEFT JOIN Reservation r ON m.Machine_ID = r.Machine_ID 
                AND r.Date = CURDATE() AND r.Status = 'Active'
            ORDER BY m.Floor, m.Machine_ID
        """)
        return cursor.fetchall()
    finally:
        cursor.close()

@app.get("/api/machines/{machine_id}")
def get_machine(machine_id: int, conn=Depends(get_db)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Laundry_Machine WHERE Machine_ID=%s", (machine_id,))
        machine = cursor.fetchone()
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        return machine
    finally:
        cursor.close()

# ── Reservations ──────────────────────────────────────────
@app.post("/api/reservations")
def create_reservation(res: ReservationCreate, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        res_date = date.today() if res.day == "Today" else date.today() + timedelta(days=1)

        # Check if slot already taken
        cursor.execute("""
            SELECT COUNT(*) FROM Reservation r
            JOIN Laundry_Timeslot lt ON r.Reservation_ID = lt.Reservation_ID
            WHERE r.Machine_ID=%s AND r.Date=%s
            AND lt.Starting_time=%s
        """, (res.machine_id, res_date, res.starting_time))
        if cursor.fetchone()[0] > 0:
            raise HTTPException(status_code=409, detail="Slot already taken")

        # Create reservation
        cursor.execute(
            "INSERT INTO Reservation (User_ID, Date, Machine_ID, Status) VALUES (%s,%s,%s,'Active')",
            (res.user_id, res_date, res.machine_id)
        )
        reservation_id = cursor.lastrowid

        # Create timeslot
        cursor.execute(
            "INSERT INTO Laundry_Timeslot (Starting_time, Ending_time, Reservation_ID, Penalty_amount) VALUES (%s,%s,%s,0.00)",
            (res.starting_time, res.ending_time, reservation_id)
        )

        # Update machine status
        cursor.execute(
            "UPDATE Laundry_Machine SET Status='In Use', Remaining_Time=%s WHERE Machine_ID=%s",
            (res.duration, res.machine_id)
        )

        conn.commit()
        return {"success": True, "reservation_id": reservation_id}
    finally:
        cursor.close()

@app.get("/api/reservations/{user_id}")
def get_user_reservations(user_id: str, conn=Depends(get_db)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT r.Reservation_ID, r.Date, r.Machine_ID, r.Status,
                   lt.Starting_time, lt.Ending_time, lt.Penalty_amount,
                   p.Amount as paid_amount
            FROM Reservation r
            LEFT JOIN Laundry_Timeslot lt ON r.Reservation_ID = lt.Reservation_ID
            LEFT JOIN Payment p ON r.Reservation_ID = p.Reservation_ID
            WHERE r.User_ID=%s
            ORDER BY r.Date DESC, lt.Starting_time DESC
            LIMIT 20
        """, (user_id,))
        return cursor.fetchall()
    finally:
        cursor.close()

@app.delete("/api/reservations/{reservation_id}")
def cancel_reservation(reservation_id: int, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT Machine_ID FROM Reservation WHERE Reservation_ID=%s", (reservation_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Reservation not found")
        machine_id = row[0]
        cursor.execute("UPDATE Reservation SET Status='Cancelled' WHERE Reservation_ID=%s", (reservation_id,))
        cursor.execute("UPDATE Laundry_Machine SET Status='Available', Remaining_Time=0 WHERE Machine_ID=%s", (machine_id,))
        conn.commit()
        return {"success": True}
    finally:
        cursor.close()

# ── Notifications ─────────────────────────────────────────
@app.get("/api/notifications/{user_id}")
def get_notifications(user_id: str, conn=Depends(get_db)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT Notification_ID, Message, Notification_Type, Status, Created_At
            FROM Notification WHERE User_ID=%s ORDER BY Created_At DESC LIMIT 10
        """, (user_id,))
        return cursor.fetchall()
    finally:
        cursor.close()

@app.patch("/api/notifications/{notification_id}/read")
def mark_read(notification_id: int, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE Notification SET Status='Read' WHERE Notification_ID=%s", (notification_id,))
        conn.commit()
        return {"success": True}
    finally:
        cursor.close()

# ── Payment ───────────────────────────────────────────────
@app.post("/api/payments")
def process_payment(payment: PaymentCreate, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        masked_card = "**** **** **** " + payment.card_number[-4:]
        cursor.execute("""
            INSERT INTO Payment (Amount, Card_Holder_Name, Card_Number, Security_Code, Expiry_Date, Reservation_ID)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (payment.amount, payment.card_holder_name, masked_card,
              "***", payment.expiry_date, payment.reservation_id))
        cursor.execute("UPDATE Reservation SET Paid=1 WHERE Reservation_ID=%s", (payment.reservation_id,))

        # Send notification
        cursor.execute("""
            INSERT INTO Notification (User_ID, Message, Notification_Type)
            VALUES (%s,%s,'Payment Confirmation')
        """, (payment.user_id, f"Payment of ${payment.amount:.2f} processed successfully."))

        conn.commit()
        return {"success": True, "message": f"Payment of ${payment.amount:.2f} confirmed"}
    finally:
        cursor.close()

# ── Health check ──────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "LaundryAI API running", "version": "1.0.0"}

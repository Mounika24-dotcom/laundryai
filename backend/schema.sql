-- LaundryAI Database Schema
-- Run this to set up a fresh database

CREATE DATABASE IF NOT EXISTS laundryai;
USE laundryai;

-- Users
CREATE TABLE IF NOT EXISTS User (
    User_ID VARCHAR(50) PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Password VARCHAR(64) NOT NULL,  -- SHA-256 hash
    Email VARCHAR(100),
    Phone VARCHAR(15)
);

-- Machines (pre-seeded, not created by users)
CREATE TABLE IF NOT EXISTS Laundry_Machine (
    Machine_ID INT AUTO_INCREMENT PRIMARY KEY,
    Status VARCHAR(20) DEFAULT 'Available',  -- Available, In Use, Done, Maintenance
    Remaining_Time INT DEFAULT 0,            -- minutes
    Floor VARCHAR(20) DEFAULT 'Floor 1',
    Type VARCHAR(20) DEFAULT 'Washer'        -- Washer, Dryer
);

-- Reservations
CREATE TABLE IF NOT EXISTS Reservation (
    Reservation_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID VARCHAR(50),
    Date DATE,
    Machine_ID INT,
    Status VARCHAR(20) DEFAULT 'Active',     -- Active, Completed, Cancelled
    Paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Machine_ID) REFERENCES Laundry_Machine(Machine_ID)
);

-- Time slots per reservation
CREATE TABLE IF NOT EXISTS Laundry_Timeslot (
    ReservationItem_ID INT AUTO_INCREMENT PRIMARY KEY,
    Starting_time TIME,
    Ending_time TIME,
    Reservation_ID INT,
    Penalty_amount DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (Reservation_ID) REFERENCES Reservation(Reservation_ID)
);

-- Payments
CREATE TABLE IF NOT EXISTS Payment (
    Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Amount DECIMAL(10,2),
    Card_Holder_Name VARCHAR(100),
    Card_Number VARCHAR(25),
    Security_Code VARCHAR(4),
    Expiry_Date DATE,
    Reservation_ID INT,
    FOREIGN KEY (Reservation_ID) REFERENCES Reservation(Reservation_ID)
);

-- Notifications
CREATE TABLE IF NOT EXISTS Notification (
    Notification_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID VARCHAR(50),
    Message TEXT,
    Notification_Type VARCHAR(100) DEFAULT 'General',
    Status VARCHAR(20) DEFAULT 'Unread',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID)
);

-- Penalty log
CREATE TABLE IF NOT EXISTS Penalty (
    Penalty_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID VARCHAR(50),
    Penalty_reason TEXT,
    Penalty_amount DECIMAL(10,2),
    Status VARCHAR(20) DEFAULT 'Unpaid',
    Issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID)
);

-- Seed machines (8 machines, 2 floors)
INSERT IGNORE INTO Laundry_Machine (Machine_ID, Status, Remaining_Time, Floor, Type) VALUES
(1,  'In Use',   18, 'Floor 1', 'Washer'),
(2,  'Available', 0, 'Floor 1', 'Washer'),
(3,  'Reserved',  0, 'Floor 1', 'Dryer'),
(4,  'Available', 0, 'Floor 1', 'Dryer'),
(5,  'Done',      0, 'Floor 2', 'Washer'),
(6,  'Available', 0, 'Floor 2', 'Washer'),
(7,  'In Use',   34, 'Floor 2', 'Dryer'),
(8,  'Available', 0, 'Floor 2', 'Dryer');

# Event Registration and Management System

## Project Overview
This system allows students to create, register for, and manage events. It includes features for event creation, registration, feedback submission, and attendance tracking.

## Description
This web service helps manage events, registrations, and attendance for students. It offers CRUD operations for events, student registration, feedback submission, and attendance tracking. The system uses role-based access control (RBAC) to distinguish between event organizers and participants, with authentication handled via Passport.js and password hashing using bcryptjs. Data is stored in MongoDB and the project is built using Node.js and Express.js. The application is hosted on [Render](https://event-manager-fjub.onrender.com).

---

## Features
- Event Creation and Management
- Student Registration and Login
- Event Registration for Students
- Feedback Submission and Viewing
- Attendance Tracking


---


## Event Routes

- **GET** `/events/all`: Get all events
- **GET** `/events/organised`: View events organized by the logged-in user
- **GET** `/events/create`: Create a new event (form)
- **GET** `/events/registered`: View events registered by the logged-in user
- **GET** `/events/:id`: View details of a single event
- **POST** `/events/create`: Create a new event
- **GET** `/events/update/:id`: Update an event (form)
- **PUT** `/events/update/:id`: Update an event
- **DELETE** `/events/:id`: Delete an event
- **GET** `/events/register/:id`: Register for an event (form)
- **POST** `/events/register/:id`: Register for an event
- **GET** `/events/attendance/:id`: Attendance for an event (form)
- **POST** `/events/attendance/save`: Save attendance
- **GET** `/events/feedback/:eventId`: Give feedback for an event (form)
- **POST** `/events/feedback/:eventId`: Submit feedback for an event
- **PUT** `/events/feedback/:eventId`: Update feedback for an event
- **GET** `/events/feedbacks/:eventId`: View all feedback for an event
---

## Student Routes

- **GET** `/students/register`: Register a new student (form)
- **POST** `/students/register`: Register a new student
- **GET** `/students/login`: Login (form)
- **POST** `/students/login`: Login
- **GET** `/students/logout`: Logout

---

## Sample Data in the Database

### Users

The database contains the following sample users:

1. **Organiser**
   - **Username**: ORG123
   - **Password**: organiser
   - **Email**: organiser@gmail.com
   - **Department**: CSE
   - **Year**: 4
   - **Role**: Organiser (This user is responsible for organizing the event)

2. **Student1**
   - **Username**: STU123
   - **Password**: student1
   - **Email**: student1@gmail.com
   - **Department**: CSE
   - **Year**: 2

3. **Student2**
   - **Username**: STU456
   - **Password**: student2
   - **Email**: student2@gmail.com
   - **Department**: CSE
   - **Year**: 1

### Event

There is also a sample event data:

- **Event Title**: CSEA Workshop
- **Description**: Workshop Conducted by CSEA
- **Date**: 2025-01-01
- **Time**: 11:00
- **Venue**: Aryabhatta
- **Capacity**: 100
- **Organizer**: CSEA
- **Tags**: Workshop

The "Organiser" user (ORG123) is responsible for organizing this event.

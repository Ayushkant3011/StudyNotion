# StudyNotion Backend

StudyNotion is a secure, role-based EdTech platform built using the MERN stack (MongoDB, Express.js, React, Node.js). It allows students to purchase and access courses, while instructors can create and manage course content. The platform includes secure authentication, e-commerce functionality, and a modular architecture with role-based access control.

## Features

- **Role-Based Access**: Supports three user roles - Students, Instructors, and Admins.
- **Authentication & Authorization**: Secure login and access control using JWT tokens, cookies, and bcrypt password encryption.
- **Payment Integration**: Razorpay API integration for processing course purchases.
- **RESTful API**: Efficient data management for course and student information with organized routes and scalable API endpoints.


## Tech Stack

- **Frontend**: React, HTML, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Payment Gateway**: Razorpay API
- **Authentication & Security**: JWT, Cookies, bcrypt

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- Razorpay account for API credentials.


### Installation

1. Clone the repository to your local machine.
    ```sh
    git clone https://github.com/Ayushkant3011/StudyNotion.git
    ```

2. Install the required packages.
    ```sh
    cd StudyNotion
    npm install
    ```

3. Set up environment variables:
   - Create a `.env` file in the root directory with the following:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     ```
4. Start the development server.
    ```sh
    npm start
    ```

## Usage

- **Student**: Can browse and purchase courses, access enrolled content.
- **Instructor**: Can create and manage courses, set course categories.
- **Admin**: Oversees platform operations and manages users.


## Project Structure

```
StudyNotion/
├── client/               # Frontend (React)
├── config/               # Environment configuration
├── controllers/          # API request controllers
├── middleware/           # Middleware (authentication, etc.)
├── models/               # Database models (User, Course)
├── routes/               # API routes
├── utils/                # Utility functions
└── .env                  # Environment variables
```





Open the project in your browser at [`http://localhost:3000`](http://localhost:3000) to view your project.




## Contact

For questions or feedback, please reach out at [ayushkant17@gmail.com](mailto:ayushkant17@gmail.com).

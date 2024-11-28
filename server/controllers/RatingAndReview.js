const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

// CreateRating
exports.createRating = async (req, res ) => {
    try{
        // Get userId
        const userId = req.user.id;

        // fetch data from request body
        const {rating, review, courseId} = req.body;

        // Check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                        {_id: courseId,
                                           studentsEnrolled: {$eleMatch: {$eq: userId}}, 
                                        });
        
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message:"Student is not enrolled in the Course",
            });
        }

        // Check if user already review the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                user: userId,
                                                course: courseId,
                                            });
        if(alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: "Course is already reviewd by the user",
            });
        }

        // create the rating and review
        const ratingReview = await RatingAndReview.create({
                                                rating, review,
                                                course: courseId,
                                                user: userId,
                                            });

        // update the course with rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id: courseId},
                                    {
                                        $push:{
                                            ratingAndReviews: ratingReview._id,
                                        },
                                    },
                                    {new: true});
        await courseDetails.save();
        console.log(updatedCourseDetails);
        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",
            ratingReview,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Internal Server error",
            error: error.message,
        });
    }
};


// getAverageRating
exports.getAverageRating = async (req, res) =>{
    try{
        // Get courseid
        const courseId = req.body.courseId;

        // calculate avg Rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id: null,
                    averageRating: { $avg: "$rating" },
                },
            },
        ]);

        // return rating
        if(result.length > 0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }
        
        // If no rating and review exist
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, no ratings given till now",
            averageRating: 0,
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



// getAllRatingAndReviews
exports.getAllRating = async (req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                                .sort({rating:"desc"})
                                                .populate({
                                                    path: "user",
                                                    select: "firstName lastName email image",
                                                })
                                                .populate({
                                                    path: "course",
                                                    select:"courseName",
                                                }).exec();
        return res.status(200).json({
            success: true,
            message: "All review fetched successfully",
            data: allReviews,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
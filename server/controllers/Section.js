const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req,res) =>{
    try{
        // Data Fetch
        const {sectionName, courseId} = req.body;
        
        // Data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing Properties",
            });
        }
        
        // Create Section
        const newSection = await Section.create({sectionName});
        
        // Update course with section ObjectID
        const updatedCourse = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent: newSection._id,
                                                }
                                            },
                                            {new: true},
                                        ).populate({
                                            path:"courseContent",
                                            populate: {
                                                path: "subSection"
                                            },
                                        }).exec();
        
        // return response
        return res.status(200).json({
            success: true,
            message: "Section Created Successfully",
            updatedCourse,
        });

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId,courseId } = req.body;
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

        const course = await Course.findById(courseId)
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        }).exec();

		res.status(200).json({
			success: true,
			message: section,
            data:course,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
            error: error.message,
		});
	}
};

exports.deleteSection = async (req,res) =>{
    try{
        // Get ID -> assuming that we are sending ID in params
        // const {sectionId} = req.params;
        const {sectionId, courseId} = req.body;
        
        await Course.findByIdAndUpdate(courseId,{
            $pull:{
                courseContent:sectionId,
            }
        });
        const section = await Section.findById(sectionId);
        console.log(sectionId, courseId);
        if(!section){
            return res.status(404).json({
                success:false,
                message:"Section Not Found",
            });
        }

        // Delete SubSection
        await SubSection.deleteMany({_id: {$in:section.subSection}});

        // use findByIdanDelete
        await Section.findByIdAndDelete(sectionId);

        // find the updated course and return
        const course = await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        }).exec();
        
        // return response
        res.status(200).json({
            success: true,
            message: "Section Deleted Successfully",
            data:course,
        });
    }
    catch(error){
        console.error("Error Deleting Section", error);
        res.status(500).json({
            success: false,
            message: "Unable to delete a section please try again",
        });
    }
};
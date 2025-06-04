const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync =require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/Listing.js");

const validateReview = (req , res ,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el) =>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }else{
      next();
    }
  };

//reviews
// post review route
router.post("/", validateReview , wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
  
    listing.reviews.push(newReview);
  
    await newReview.save();
    await listing.save();
    req.flash("success", "new review created");
    res.redirect(`/listings/${listing._id}`);
  }));

  // Delete Review Route
router.delete(
    "/:reviewId",
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        
        // Remove the review from the listing's reviews array
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        
        // Delete the review itself
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "review deleted");
        // Redirect to the listing page
        res.redirect(`/listings/${id}`);

    })
);

module.exports= router;
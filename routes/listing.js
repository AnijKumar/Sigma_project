const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const { storage } = require("../cloudConfig.js");
const multer  = require('multer');
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

router.route("/")
    .get(wrapAsync(listingController.index))        // Index Route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));     // Create Route (Actual creation of new data)
    

// New Route (To provide form)   [ Written before show route as code gets confused between /new and /:id, it treats new as id and looks for it inside database ]
router.get("/new", isLoggedIn, listingController.renderNewForm);


router.route("/:id")
  .get(wrapAsync(listingController.showListing))        // Show Route
  .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))         // Update Route (Actual updation after edit) 
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));        // Delete Route


// Edit Route (To provide form)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings} );
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();
    
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;   // Coordinates stored in DB

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created !");
    res.redirect("/listings");
};


module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    
    const listing = await Listing.findById(id)
    .populate({         // Nested populate (Populate review then populate author of each review, to use author.username in show.ejs)
        path: "reviews", 
        populate: {
            path: "author"
        }
    })
    .populate("owner");

    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    } else {
        res.render("listings/show.ejs", {listing} );
    }
};


module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    } else {
        let previewImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");  // Sets height and width to 300 and 250 pixels respectively
        res.render("listings/edit.ejs", { listing, previewImageUrl });
    }
};


module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});   // Image field is not a part of req.body.listing because it accepts files now

    if(typeof req.file !== "undefined") {       // Updating image field is handled here
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();

    listing.geometry = response.body.features[0].geometry;   // Coordinates updated in DB
    await listing.save();
    
    req.flash("success", "Listing Updated !");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
};
const Item = require('../models/Item')
const Treasure = require('../models/Activity')
const Traveler = require('../models/Member')
const Category = require('../models/Category')

module.exports = {
    landingPage: async(req, res) => {
        try {
            const mostPicked = await Item.find()
                .select('_id title country city price unit categoryId')
                .limit(5)
                .populate({path: 'imageId', select: '_id imageUrl'})
            const category = await Category.find()
                .select('_id name itemId')
                .limit(3)
                .populate({
                    path: 'itemId', 
                    select: '_id title country city price isPopular imageId',
                    perdocumentLimit: 4,
                    option: { sort: { sumbooking: -1 } },
                    populate:{path: 'imageId', select: '_id imageUrl', perdocumentLimit: 1}
                })

            const city = await Item.estimatedDocumentCount()
            const traveler = await Traveler.estimatedDocumentCount()
            const treasure = await Treasure.estimatedDocumentCount()
    
            
            // Logic for isPopular field handler --start
            for (let i = 0; i < category.length; i++) {
                for (let x = 0; x < category[i].itemId.length; x++) {
                    const item = await Item.findOne({_id: category[i].itemId[x]._id })
                    item.isPopular = false
                    await item.save()
                    if (category[i].itemId[0] === category[i].itemId[x]){
                        item.isPopular = true
                        await item.save()
                    }
                }
            }
            // Logic for isPopular field handler --end

            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial2.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Angga",
                familyOccupation: "Product Designer"
            }            

            res.status(200).json({
                hero: {
                    traveler,
                    treasure,
                    cities: city
                },
                mostPicked,
                category,
                testimonial
            })
        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    }
}
const {Router} = require('express');
const { check, validationResult } = require('express-validator');
const Story = require('../models/story');
const User = require('../models/user');
const multer  = require('multer');
const router = Router();
const path = require("path");

const pathDataUploads = 'data/uploads/';
var storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, './public/' + pathDataUploads); },
    filename: (req, file, cb) => { cb(null, Math.random() + path.extname(file.originalname))} 
});
var upload = multer({ 
    storage: storage
});

router.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

router.get('/', async (req, res) => {
    const stories = await Story.find().count();

    res.render('index', {
        title: "Twins - истории интернета",
        isIndex: true,
        stories
    });
});

router.get('/getStories', async (req, res) => {
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const stories = await Story.find()
        .sort({date: -1})
        .limit(limit)
        .skip((page - 1) * limit);

    var response = [];

    for (const item of stories) {
        const authorName = await User.findById(item.owner);
        var story = {
            description: item.description,
            id: item._id,
            imageUrl: item.image,
            author: authorName.login
        };
        response.push(story);
    }

    res.json(response);
});

router.get('/write', ensureAuth, (req, res) => {
    res.render('write', {
        title: "Написать твинс",
        isWrite: true
    });
});

router.post('/write', 
    ensureAuth, 
    upload.single('photo'),
    [
        check('title').isLength({max: 50}).notEmpty().withMessage("В названии должно быть не более 50 символов"),
        check('description').isLength({max: 120}).notEmpty().withMessage("Описание должно быть не более 120 символов"),
        check('content').notEmpty().withMessage("Твинк должен содержать историю"),
        check('photo').custom((val, {req}) => {

            if (req.file != undefined)
                switch(req.file.mimetype)
                {
                    case 'image/png':
                        return true;
                    case 'image/jpeg': 
                        return true;
                    default: 
                        throw new Error('Требуется изображение');
                }
            else 
                return true;

        })
    ],
    async (req, res) => 
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            res.render('write', {
                title: "Написать твинс",
                isWrite: true,
                errors: errors.array()
            });
            return;
        }

        const objectStory = {
            title: req.body.title,
            content: req.body.content,
            description: req.body.description,
            owner: req.user._id
        }

        if (req.file != undefined)
            objectStory.image = pathDataUploads + req.file.filename

        const story = new Story(objectStory);
        await story.save();

        res.redirect('/story/' + story._id);
    }
);

router.get('/story/:id', async (req, res) => {
    const storyId = req.params.id;
    const story = await Story.findById(storyId);
    const user = await User.findById(story.owner);
    res.render('story', {
        title: story.title,
        story: story,
        user: user
    });
});

router.get('/about', (req, res) => 
{
    res.render('about', {
        title: "Что такое Twins?",

    })
});

// Access Control
function ensureAuth(req, res, next) 
{
    if (req.isAuthenticated())
        return next();
    else 
    {
        req.flash('error', 'Для этого действия нужна авторизация');
        res.redirect('/login');
    }
}

module.exports = router;
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Handlebars = require('handlebars')
const methodOverride = require('method-override')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const port = 3000


// Handlebars
app.engine('handlebars', exphbs());
app.engine('handlebars', exphbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');
// Load Task Model
require('./models/task')
const Task = mongoose.model('Tasks')

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
    // Method Override middleware
app.use(methodOverride('_method'))

// Connect to mongoose
mongoose.connect('mongodb://localhost/TaskAppHandlebars', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})


// Main page
app.get('/', (req, res) => {
    const title = 'Welcome'
    res.render('index', { title })
})

// About page
app.get('/about', (req, res) => {
    res.render('about')
})

// Add Task Form
app.get('/tasks/add', (req, res) => {
    res.render('tasks/add')
})

// Edit Task Form
app.get('/tasks/edit/:id', (req, res) => {
    Task.findOne({
            _id: req.params.id
        })
        .then(task => {
            res.render('tasks/edit', {
                task: task
            })
        })
})

// Get Tasks
app.get('/tasks', (req, res) => {
    Task.find({})
        .sort({ date: 'desc' })
        .then(tasks => {
            res.render('tasks/index', {
                tasks: tasks
            })
        })
})

// Process Form
app.post('/tasks', (req, res) => {
    let errors = []
    console.log(req.body)

    if (!req.body.title) {
        errors.push({ text: 'Please add title' })
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add details' })
    }
    if (errors.length > 0) {
        res.render('tasks/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details,
        })
    } else {
        const newTask = {
            title: req.body.title,
            details: req.body.details

        }
        new Task(newTask)

        .save()
            .then(task => {
                res.redirect('tasks')
            })
    }
})

// Edit Form Process
app.put('/tasks/:id', (req, res) => {
    Task.findOne({
            _id: req.params.id
        })
        .then(task => {
            task.title = req.body.title,
                task.details = req.body.details
            task.save()
                .then(task => {
                    res.redirect('/tasks')
                })
        })
})




app.listen(port, () => {
    console.log(`App listen to port ${port}`)
})
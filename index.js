// require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
// const mongoString = 'mongodb+srv://pdarchibald:Musicman611!@cluster0.rburzaf.mongodb.net/TODO_SCHEDULER';
const mongoString = 'mongodb+srv://pdarchibald:Musicman611!@cluster0.rburzaf.mongodb.net/Todo'
const app = express();
const cors = require('cors');
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 3001;
// const port ="https://parker-archibald-todo-api.herokuapp.com";

app.use (cors());
app.use(express.json());


app.get("/", function(req, res) {
    //when we get an http get request to the root/homepage
    res.send("Hello World");
  });

// Get all tasks

app.get('/getAllTasks/:userId', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection("Tasks");
    if(collection.find({userId: req.params.userId})) {
        collection.find({userId: req.params.userId}).toArray((err, results) => {
                if(!err) {
                    res.send(results)
                }
                else {
                    console.log(err)
                    res.send(err) 
                }
            })
    }
    else {
        res.send('none')
    }

})

// Get todos for user and task

app.get('/getTodos/:userId/:task_name', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection("todos");

    let newData = [];

    if(collection.find({userId: req.params.userId})) {
        collection.find({userId: req.params.userId}).toArray((err, results) => {
            for(let i = 0; i < results.length; i++) {
                
                if(results[i].task_name === req.params.task_name) {
                    newData.push(results[i])
                }
            }
            res.send(newData)
        })
    }
        
    else {
        res.status(403).send("User not Found")
    }
})

// Get User for login

app.get('/getUser/:email/:password', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection("Users");
    if(collection.find({email: req.params.email})) {
        collection.find({email: req.params.email}).toArray((err, results) => {
            if(results[0].password === req.params.password) {
                const newData = results;
                delete newData[0].password;
                res.send(newData)
                
            }
            else {
                res.status(401).send("Incorrect Password") 
            }
        })
    }
    else {
        res.status(401).send("No User Found")
    }
})

// Get user for settings by ID

app.get('/getUser/:userId', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection("Users");
    if(collection.find({_id: ObjectId(`${req.params.userId}`)})) {
        collection.find({_id: ObjectId(`${req.params.userId}`)}).toArray((err, results) => {
            let newData = results;
            delete newData[0].password;
            res.send(newData)
        })
    }
    else {
        res.status(401).send("No User Found")
    }
})

// Post a new task

app.post('/postTask/:userId', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    console.log(req.body.userId)
    const collection = database.collection("Tasks");
    collection.insertMany([
        {
            task_name: req.body.task_name,
            userId: req.params.userId,
            date: req.body.date,
            time: req.body.time,
            notes: req.body.notes,
        }
    ])
    res.send('Task Created')
}) 
 
// Create new user

app.post('/newUser', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection("Users");
    collection.insertMany([
        {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password
        }
    ])
    res.send('User Created');
})

// Post new TODO

app.post('/newTodo/:task_name', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection("todos");
    collection.insertMany([
        {
            userId: req.body.userId,
            task_name: req.params.task_name,
            todo_name: req.body.todo_name,
            time: req.body.time,
            notes: req.body.notes,
            isCompleted: false
        }
    ])
    res.send("Todo Created")
})

// Update isCompleted new

app.put('/todoCompleted/:todoId/:isCompleted', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('todos');

    collection.updateOne({"_id": ObjectId(`${req.params.todoId}`)}, {$set: {isCompleted: req.params.isCompleted}})
    res.send('updated');

})

// edit single todo item

app.put('/updateTodo/:task_name/:todo_name', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('Tasks');

    if(collection.find({task_name: req.params.task_name})) {
        collection.find({task_name: req.params.task_name}).toArray((err, info) => {
            const data = info;

            for(let i = 0; i < data[0].items.length; i++) {
                if(data[0].items[i].todo_name === req.params.todo_name) {
                    data[0].items[i] = req.body;
                    collection.updateOne({task_name: req.params.task_name}, {$set: data[0]}, {upsert: true});
                    res.send("Updated " + req.params.todo_name)
                }
                else {
                    console.log('Not Found at ' + i)
                } 
            }
        })
        
    }
})

// Update todo

app.put('/updateTodo/:todoId', async(req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('todos');

    // collection.updateOne({"_id": ObjectId(req.params.todoId)}, {$set: {}})
    collection.find({"_id": ObjectId(req.params.todoId)}).toArray((err, results) => {
        const data = results[0];
        data.todo_name = req.body.todo_name;
        data.time = req.body.time;
        data.notes =  req.body.notes;
        
        collection.updateOne({"_id": ObjectId(req.params.todoId)}, {$set: data}, {upsert: true})
        res.send('todo updated')
    })
})

// Delete todo

app.delete('/deleteTodo/:todo_id', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('todos');

    if(collection.find({"_id": ObjectId(req.params.todo_id)})) {
        collection.deleteOne({"_id": ObjectId(req.params.todo_id)});
        res.send("Todo Deleted")
    }
    else {
        res.status(403).send("Todo not found");
    }
})

// Delete Task

app.delete('/deleteTask/:task_name', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('Tasks');
    if(collection.find({task_name: req.params.task_name})) {
        collection.deleteOne({task_name: req.params.task_name});
        res.send("Deleted " + req.params.task_name);
    }
    else {
        res.send("Task not found");
    }
})

// Settings

app.get('/getTheme', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('Settings');
    collection.find({settingName: 'themes'}).toArray((err, results) => {
        res.send(results);
    })
})

app.put('/setTheme/:primary/:secondary', async (req, res) => {
    await mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('Settings');

    collection.find({settingName: 'themes'}).toArray((err,results) => {
        const newData = results;
        newData[0].themeColors.primary = req.params.primary;
        newData[0].themeColors.secondary = req.params.secondary;

        collection.updateOne({settingName: 'themes'}, {$set: newData[0]}, {upsert: true});
        res.send({status: 'Theme updated'});
    })
})

app.listen(port, () => {
    console.log(`Server Started at ${port}`)
})

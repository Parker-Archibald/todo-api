// require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const mongoString = 'mongodb+srv://pdarchibald:Musicman611!@cluster0.rburzaf.mongodb.net/Todo';
const app = express();
const cors = require('cors');
// const port = process.env.PORT || 3001;
const port ="https://parker-archibald-todo-api.herokuapp.com/";

app.use (cors());
app.use(express.json());

mongoose.connect(mongoString);
const database = mongoose.connection;

app.get("/", function(req, res) {
    //when we get an http get request to the root/homepage
    res.send("Hello World");
  });

// Get all tasks

app.get('/getAllTasks', (req, res) => {
    const collection = database.collection("Tasks");
    collection.find({}).toArray((err, results) => {
        if(!err) {
            res.send(results)
        }
        else {
            console.log(err)
            res.send(err)
        }
    })
})

// Get all info for one task

app.get('/getTask/:task_name', (req, res) => {
    const collection = database.collection("Tasks");
    collection.find({task_name: req.params.task_name}).toArray((err, results) => {
       res.send(results)
    })
})

// Post a new task

app.post('/postTask', (req, res) => {
    mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection("Tasks");
    collection.insertMany([
        {
            task_name: req.body.task_name,
            date: req.body.date,
            time: req.body.time,
            notes: req.body.notes,
            items: []
        }
    ])
    res.send('Task Created')
}) 

// Add TODO items to Task

app.put('/putToDo/:task_name', (req, res) => {
    mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('Tasks');
    const data = {
        todo_name: req.body.todo_name,
        time: req.body.time,
        notes: req.body.notes,
        isCompleted: req.body.isCompleted,
    }
    
    if(collection.find({task_name: req.params.task_name})) {
        collection.find({task_name: req.params.task_name}).toArray((err, info) => {
            const newData = info;
            newData[0].items.push(data);
            // console.log(newData[0].items[2]);

            collection.updateOne({task_name: req.params.task_name}, {$set: newData[0]}, {upsert: true});
        })
        
        res.send('To Do item added')
        
    }
    else {
        res.send('Task not found');
    }
})

// Change isCompleted

app.put('/isCompleted/:task_name/:todo_name/:isCompleted', (req, res) => {
    mongoose.connect(mongoString);
    const database = mongoose.connection;
    const collection = database.collection('Tasks');

    if(collection.find({task_name: req.params.task_name})) {
        collection.find({task_name: req.params.task_name}).toArray((err, info) => {
            
            const newData = info;
            // console.log(req.params.task_name + ' ' + req.params.todo_name + ' ' + req.params.isCompleted)

            for(let i = 0; i < newData[0].items.length; i++) {

                if(newData[0].items[i].todo_name === req.params.todo_name) {
                    newData[0].items[i].isCompleted = req.params.isCompleted;

                    collection.updateOne({task_name: req.params.task_name}, {$set: newData[0]}, {upsert: true});
                    res.send('Item Updated');
                    return;
                    
                }
                else {
                    console.log('not found at ' + i)
                }
            }
        }) 
    }
})

// edit single todo item

app.put('/updateTodo/:task_name/:todo_name', (req, res) => {
    mongoose.connect(mongoString);
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

// Delete todo

app.delete('/deleteTodo/:task_name/:todo_name', (req, res) => {
    const collection = database.collection('Tasks');
    collection.find({task_name: req.params.task_name}).toArray((err, results) => {
        const data = results[0];

        for(let i = 0; i < data.items.length; i++) {
            if(data.items[i].todo_name === req.params.todo_name) {
                data.items.splice(i, 1);
                

                collection.updateOne({task_name: req.params.task_name}, {$set: data}, {upsert: true})
                
                res.send("Deleted " + req.params.todo_name);
            }
            else console.log('not found at ' + i);
        }
    })
})

// Delete Task

app.delete('/deleteTask/:task_name', (req, res) => {
    const collection = database.collection('Tasks');
    if(collection.find({task_name: req.params.task_name})) {
        collection.deleteOne({task_name: req.params.task_name})

        res.send("Deleted " + req.params.task_name);
    }
    else {
        res.send("Task not found");
    }
})

app.listen(port, () => {
    console.log(`Server Started at ${port}`)
})

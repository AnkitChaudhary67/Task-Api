const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const mongoose=require('mongoose');


const tasks = [];


mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });


const taskSchema = new mongoose.Schema({
  title: String,
  is_completed: Boolean
});





const Task = mongoose.model('Task', taskSchema);


const generateId = () => {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(task => task.id)) + 1;
};


app.use(express.json());


app.post('/v1/tasks', (req, res) => {
  const task = req.body;
  task.id = generateId();
  task.is_completed = task.is_completed || false;
  tasks.push(task);
  res.status(201).send({ id: task.id });
});


app.get('/v1/tasks', (req, res) => {
  res.send({ tasks });
});


app.get('/v1/tasks/:id', (req, res) => {
  const task = tasks.find(task => task.id === Number(req.params.id));
  if (!task) return res.status(404).send({ error: 'There is no task at that id' });
  res.send(task);
});


app.delete('/v1/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(task => task.id === Number(req.params.id));
  if (taskIndex === -1) return res.status(204).send();
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});


app.put('/v1/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(task => task.id === Number(req.params.id));
  if (taskIndex === -1) return res.status(404).send({ error: 'There is no task at that id' });
  const task = tasks[taskIndex];
  task.title = req.body.title || task.title;
  task.is_completed = req.body.is_completed || task.is_completed;
  tasks[taskIndex] = task;
  res.status(204).send();
});


app.post("/v1/tasks", (req, res) => {
    const taskList = req.body.tasks;
    taskList.forEach((task) => {
    const id = tasks.length + 1;
    tasks.push({
    id,
    title: task.title,
    is_completed: task.is_completed,
    });
    });
    res.status(201).json({ tasks: taskList.map((_, i) => ({ id: i + 1 })) });
    });
    
 
    app.delete("/v1/tasks", (req, res) => {
    const taskIds = req.body.tasks.map((task) => task.id);
    tasks = tasks.filter((task) => !taskIds.includes(task.id));
    res.status(204).send();
    });



app.listen(port, () => {
  console.log(`Task API listening on port ${port}`);
});

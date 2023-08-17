const Axios = require("axios");
const { CANVAS_TOKEN, DOMAIN } = require("./config.json");
const date_fns = require("date-fns");
var colors = require("colors");

const axios = new Axios.Axios();
axios.defaults = {};
axios.defaults.headers = { Authorization: `Bearer ${CANVAS_TOKEN}` };
axios.defaults.baseURL = DOMAIN;

function parseResponseHeaders(response) {
  return response.headers.link
    .split(",")
    .map((e) => e.match(/<(.*)>; rel="(.*)"/))
    .map((header) => ({ [header[2]]: header[1] }))
    .reduce((ctx, obj) => ({ ...ctx, ...obj }), {});
}

async function main() {
  const response = await axios.get(`/api/v1/planner/items?start_date=${new Date().toISOString()}`);
  let tasks = JSON.parse(response.data);
  let links = parseResponseHeaders(response);

  while (links.next) {
    const response = await axios.get(links.next);
    tasks = tasks.concat(JSON.parse(response.data));
    links = parseResponseHeaders(response);
  }

  // get the most important data and make it more managable
  const taskPojos = tasks.map((task) => ({
    completed: task.planner_override ? task.planner_override.marked_complete : task.submissions.submitted,
    name: task.plannable.title.trim(),
    course: task.context_name,
    due: task.plannable.due_at,
  }));

  // organize taskPojos based on course name then convert them into an array so they can be sorted based on number of items
  const courseArray = Object.entries(
    taskPojos.reduce((courses, task) => {
      if (courses[task.course] == null) courses[task.course] = [];
      courses[task.course].push(task);
      return courses;
    }, {})
  ).sort(([firstCourseName, firstCourseTasks], [secondCourseName, secondCourseTasks]) => {
    if (firstCourseTasks.length > secondCourseTasks.length) return -1;
    if (firstCourseTasks.length < secondCourseTasks.length) return 1;

    // they are equal in length so compare them based on number of finished tasks

    if (firstCourseTasks.filter((e) => e.completed).length > secondCourseTasks.filter((e) => e.completed).length)
      return -1;
    if (firstCourseTasks.filter((e) => e.completed).length < secondCourseTasks.filter((e) => e.completed).length)
      return 1;

    // equal in number of finished tasks so compare them using the name
    return firstCourseName < secondCourseName ? -1 : 1;
  });

  courseArray.forEach(([name, tasks]) => {
    // sort tasks
    tasks = [...sortTasks(tasks.filter((e) => e.completed)), ...sortTasks(tasks.filter((e) => !e.completed))];

    console.log(name.yellow);

    tasks.forEach((task) => {
      const due_date = date_fns.format(new Date(task.due), "yyyy-MM-dd hh:mm");
      const str = `    ${task.completed ? "✓" : "⨉"}  - ${due_date} - ${task.name}`;
      console.log(task.completed ? str.green : str.red);
    });
  });
}

function sortTasks(taskArray) {
  return taskArray.sort((taskA, taskB) => {
    if (taskA.due === taskB.due) return 0;
    else if (taskA.due > taskB.due) return 1; // b should appear before a because b is earlier
    else return -1;
  });
}

main();

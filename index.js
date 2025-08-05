import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import fs from 'fs-extra';

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

/*const submit = [
   { id: 1, title: "What To Do", author: "Unknown Author", content: "What should one do? That may seem a strange question, but it's not meaningless or unanswerable. It's the sort of question kids ask before they learn not to ask big questions. I only came across it myself in the process of investigating something else. But once I did, I thought I should at least try to answer it. So what should one do? One should help people, and take care of the world. Those two are obvious. But is there anything else? When I ask that, the answer that pops up is Make good new things." },
   { id: 2, title: "The Shape of the Essay Field",  author: "Unknown Author", content: "An essay has to tell people something they don't already know. But there are three different reasons people might not know something, and they yield three very different kinds of essays. One reason people won't know something is if it's not important to know. That doesn't mean it will make a bad essay. For example, you might write a good essay about a particular model of car. Readers would learn something from it. It would add to their picture of the world. For a handful of readers it might even spur some kind of epiphany. But unless this is a very unusual car its not critical for everyone to know about it." },
   { id: 3, title: "Good Writing",  author: "Unknown Author", content: "There are two senses in which writing can be good: it can sound good, and the ideas can be right. It can have nice, flowing sentences, and it can draw correct conclusions about important things. It might seem as if these two kinds of good would be unrelated, like the speed of a car and the color it's painted. And yet I don't think they are. I think writing that sounds good is more likely to be right." },
];
*/

const submit = [];

fs.readFile('public/files/database.txt', 'utf8', (err, data) => {
    if(err) throw err;

    const postsRaw = data.split('---'); // Split by separator

    postsRaw.forEach(post => {
        const lines = post.trim().split('\n');
        if(lines.length >= 4){
       const id = parseInt(lines[0].trim()); //id
        const title = lines[1].trim(); //title
        const author = lines[2].trim(); //author
        const content = lines.slice(3).join('\n\n').trim(); //content

        submit.push({id, title, author, content});
        }
    });
    console.log(submit.length);
});

function saveBlogsToFile() {
  const formatted = submit.map(blog => {
    return `${blog.id}\n${blog.title}\n${blog.author}\n${blog.content}\n---`;
  }).join('\n');

  fs.writeFile('public/files/database.txt', formatted, err => {
    if (err) console.error("Error writing file:", err);
  });
}

app.get("/", (req, res) => {
  res.render("index.ejs", {blogs: submit, route: "/"});
});


app.get("/newpost", (req, res) => {
  res.render("newpost.ejs", {route: "/newpost"});
});

app.post("/submit", (req, res) => {
  
   const newBlog = { 
    id: submit.length + 1,
    title: req.body.Title,
    author: req.body.Author,
    content: req.body.Content,
   };
   submit.push(newBlog);
   saveBlogsToFile();
   res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const blogId = parseInt(req.params.id);
  const index = submit.findIndex(b => b.id === blogId);
  
  if (index === -1) return res.status(404).send("Blog not found");
  
  res.render("edit.ejs", { blog: submit[index], route: "/edit" });
});

app.post("/update/:id", (req, res) => {
  const blogId = parseInt(req.params.id);
  const index = submit.findIndex(b => parseInt(b.id) === blogId);

  if (index === -1) {
    return res.status(404).send("Blog not found");
  }
    submit[index].title = req.body.Title;
    submit[index].author = req.body.Author;
    submit[index].content = req.body.Content;
    saveBlogsToFile();
  res.redirect("/");
});


app.post("/delete/:id", (req, res) => {
  const blogId = parseInt(req.params.id);
  const index = submit.findIndex(b => parseInt(b.id) === blogId);

  if (index !== -1) {
    submit.splice(index, 1);
  }
  saveBlogsToFile();
  res.redirect("/");
});

app.get("/faqs", (req, res) => {
  res.render("faqs.ejs", {route: "/faqs"});
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs", {route: "/contact"});
});

app.get("/about", (req, res) => {
  res.render("about.ejs", {route: "/about"});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});



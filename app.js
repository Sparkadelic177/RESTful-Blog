var bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express();


//first thing to do is to connect to the databse
mongoose.connect('mongodb://localhost/restful_blog');

//views all the files in the views folder as ejs, no need for filename.ejs, just filename
app.set("view engine", "ejs");

//to serve images, CSS files, and JavaScript files in a directory named public:
app.use(express.static('public'));

//setting up the body parser
app.use(bodyParser.urlencoded({extended:true}));

//has to be used after the body-parser inorder to sanitize
app.use(expressSanitizer());

app.use(methodOverride('_method'));

//creating the schema table
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type:Date , default:Date.now}

})

//creating the model
var Blog = mongoose.model('Blog', blogSchema);

//Routes
app.get("/",function(req,res){
    res.redirect('/blogs');
})

//home page / index
app.get("/blogs",function(req, res){
    Blog.find({},function(error, blog){
        if(error){
            console.log('error: ' + error)
        }else{
            res.render('index', {blog: blog})
        }
    });
});

//page to make a new post
app.get('/blogs/new',function(req,res){
  res.render('new');
})

//creating a new post
app.post('/blogs',function(req,res){
  req.body.blog.body = req.sanitize(req.body.blog.body) //sanitize unwanted user code
  //creating a new blog post
  Blog.create(req.body.blog,function(err, newBlog){
      if(err){
        res.render('new')
      }else{
        res.redirect('/blogs')
      }
  });
});

//showing more information about a blog post
app.get('/blogs/:id',function(req,res){
  Blog.findById(req.params.id, function(err, blogFound){
    if(err){
      res.redirect('/blogs')
    }else{
      res.render('show', {blog:blogFound})
    }
  })
})

//edit route
app.get('/blogs/:id/edit',function(req,res){
  Blog.findById(req.params.id,function(err, blogFound){
    if(err){
      res.redirect('/blogs')
    }else{
      res.render('edit',{blog:blogFound})
    }
  })
});

//upadate route //being done in the edit page to put on the show page
app.put('/blogs/:id',function(req,res){
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err){
      res.redirect("/blogs");
    }else{
      console.log(updatedBlog)
      res.redirect('/blogs/' + req.params.id)
    }
  })
});

//Destory route
app.delete('/blogs/:id',function(req,res){
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.send(err);
    }else{
      res.redirect('/blogs')
    }
  })
})



//set up the listener to the server
app.listen(3000, process.env.IP, function(){
    console.log("Server is running")
  });

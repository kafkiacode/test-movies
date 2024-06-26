const Movie = require('../models/movie');
const Performer = require('../models/performer');

module.exports = {
  index,
  show,
  new: newMovie,
  create
};

async function index(req, res) {
  console.log('session', req.session);
  console.log('user', req.user);
  // console.log(req.user)

  const movies = await Movie.find({});
  res.render('movies/index', { title: 'All Movies', movies });
}

async function show(req, res) {
  // Populate the cast array with performer docs instead of ObjectIds
  const movie = await Movie.findById(req.params.id).populate('cast');
  // Mongoose query builder approach to retrieve performers not the movie:
    // Performer.find({}).where('_id').nin(movie.cast)
  // The native MongoDB approach uses a query object to find 
  // performer docs whose _ids are not in the movie.cast array like this:
  const performers = await Performer.find({ _id: { $nin: movie.cast } }).sort('name');
  res.render('movies/show', { title: 'Movie Detail', movie, performers });
}

function newMovie(req, res) {
  // We'll want to be able to render an  
  // errorMsg if the create action fails
  res.render('movies/new', { title: 'Add Movie', errorMsg: '' });
}

async function create(req, res) {
  // convert nowShowing's checkbox of nothing or "on" to boolean
  req.body.nowShowing = !!req.body.nowShowing;
  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }
  try {
    // Update this line because now we need the _id of the new movie
    const movie = await Movie.create(req.body);
    // Redirect to the new movie's show functionality 
    res.redirect(`/movies/${movie._id}`);
  } catch (err) {
    // Typically some sort of validation error
    console.log(err);
    res.render('movies/new', { errorMsg: err.message });
  }
}
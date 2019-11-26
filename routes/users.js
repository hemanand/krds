var express = require('express')
var app = express()
var passport = require('passport');

app.get('/', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM books',function(err, rows, fields) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				res.render('user/list', {
					title: '',
					isbn: '',
					pagecount: '',
					publishedDate: '',
					shortDescription : '',
					status : '',
					authors : '',
					categories : '',

				})
			} else {
				res.render('user/list', {
					title: 'Book List', 
				})
			}
		})
	})
})

// SHOW LIST OF BOOKS
app.get('/booklist', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM books',function(err, rows, fields) {
			if (err) {
				req.flash('error', err)
				res.render('user/list', {
					title: '',
					isbn: '',
					pagecount: '',
					publishedDate: '',
					shortDescription : '',
					status : '',
					authors : '',
					categories : '',
				})
			} else {
				res.end(JSON.stringify(rows));
			}
		})
	})
})

app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users/');
  });



// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('user/add', {
		title: '',
		isbn: '',
		pagecount: '',
		publishedDate: '',
		shortDescription : '',
		status : '',
		authors : '',
		categories : '',
	})
})

// ADD NEW USER POST ACTION
app.post('/addentry', function(req, res, next){	
	req.assert('title', 'Title is required').notEmpty()          			 	//Validate title
	req.assert('isbn', 'ISBN is required').notEmpty()             				//Validate isbn
    req.assert('pagecount', 'pagecount is required').notEmpty()  				//Validate pagecount
    req.assert('publishedDate', 'publishedDate is required').notEmpty()         //Validate publishedDate
	req.assert('shortDescription', 'shortDescription is required').notEmpty()   //Validate shortDescription
    req.assert('status', 'status is required').notEmpty()  						//Validate status
    req.assert('authors', 'authors is required').notEmpty()           			//Validate authors
	req.assert('categories', 'categories is required').notEmpty()             	//Validate categores

    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		var booklist = {
			title			: req.sanitize('title').escape(),
			isbn			: req.sanitize('isbn').escape(),
			pagecount		: req.sanitize('pagecount').escape(),
			publishedDate	: req.sanitize('publishedDate').escape(),
			shortDescription: req.sanitize('shortDescription').escape(),
			status			: req.sanitize('status').escape(),
			authors		: req.sanitize('authors').escape(),
			categories		: req.sanitize('categories').escape(),
		}
		
		req.getConnection(function(error, conn) {

			conn.query('SELECT * FROM books where isbn = "'+req.body.isbn+'"',function(err, rows, fields) {
				if (err) {
					req.flash('error', err)
					res.render('user/list', {
						title: 'Book List', 
						data: ''
					})
				} else {
					if(rows.length == 0){
							conn.query('INSERT INTO books (title,isbn,pagecount,publishedDate,shortDescription,status,authors,categories) values("'+booklist.title+'","'+booklist.isbn+'","'+booklist.pagecount+'","'+booklist.publishedDate+'","'+booklist.shortDescription+'","'+booklist.status+'","'+booklist.authors+'","'+booklist.categories+'")', function(err, result) {
							if (err) {
								req.flash('error', err)
								res.render('user/add', {
									title 			 : req.body.title,
									isbn 			 : req.body.isbn,
									pagecount 		 : req.body.pagecount,
									publishedDate 	 : req.body.publishedDate,
									shortDescription : req.body.shortDescription,
									status 			 : req.body.status,
									authors 		 : req.body.authors,
									categories 		 : req.body.categories,
								})
							} else {				
								req.flash('success', 'Data added successfully!')
								res.render('user/add', {
									title: '',
									isbn: '',
									pagecount: '',
									publishedDate: '',
									shortDescription : '',
									status : '',
									authors : '',
									categories : '',				
								})
							}
						})
						}else{
							conn.query('update books SET title = "'+booklist.title+'",pagecount = "'+booklist.pagecount+'",publishedDate = "'+booklist.publishedDate+'",shortDescription = "'+booklist.shortDescription+'",status = "'+booklist.status+'",authors = "'+booklist.authors+'",categories = "'+booklist.categories+'" where isbn="'+booklist.isbn+'"', function(err, result) {
								if (err) {
									req.flash('error', err)
									res.render('user/add', {
										title 			 : req.body.title,
										isbn 			 : req.body.isbn,
										pagecount 		 : req.body.pagecount,
										publishedDate 	 : req.body.publishedDate,
										shortDescription : req.body.shortDescription,
										status 			 : req.body.status,
										authors 		 : req.body.authors,
										categories 		 : req.body.categories,
									})
								} else {				
									req.flash('success', 'Data updated successfully!')
									res.render('user/add', {
										title: '',
										isbn: '',
										pagecount: '',
										publishedDate: '',
										shortDescription : '',
										status : '',
										authors : '',
										categories : '',				
									})
								}
							})
						}
				}
			})
		})
	}
	else {   
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
	 
        res.render('user/add', { 
			title 			 : req.body.title,
			isbn 			 : req.body.isbn,
			pagecount 		 : req.body.pagecount,
			publishedDate 	 : req.body.publishedDate,
			shortDescription : req.body.shortDescription,
			status 			 : req.body.status,
			authors 		 : req.body.authors,
			categories 		 : req.body.categories,				
        })
    }
})


//  USER Login POST ACTION
app.post('/login', function(req, res, next){	
	req.assert('useremail', 'useremail is required').notEmpty()          			 	//Validate useremail
	req.assert('password', 'Password is required').notEmpty()             				//Validate password
    var errors = req.validationErrors()
	if( !errors ) {   //No errors were found.  Passed Validation!
		
		var userlist = {
			useremail			: req.sanitize('useremail').escape(),
			password			: req.sanitize('password').escape(),
		}
		
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM login_users where useremail = "'+req.body.useremail+'" and password="'+req.body.password+'"',function(err, rows, fields) {
				if (err) {
					req.flash('error', err)
					res.redirect('/');
				}else{
					console.log(rows.length);
					if(rows.length == 0){
						res.redirect('/');
					}else{
						res.redirect('/users/');
					}
				}
			})
		})
	}else {   
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
        res.render('user/edit', { 
            useremail: req.body.useremail,
			password: req.body.password
        })
    }

})



//  USER Signup POST ACTION
app.post('/signup', function(req, res, next){	
	req.assert('useremail', 'useremail is required').notEmpty()          			 	//Validate useremail
	req.assert('password', 'Password is required').notEmpty()             				//Validate password
    var errors = req.validationErrors()
	if( !errors ) {   //No errors were found.  Passed Validation!
		
		var userlist = {
			useremail			: req.sanitize('useremail').escape(),
			password			: req.sanitize('password').escape(),
		}
		
		req.getConnection(function(error, conn) {
			conn.query('SELECT * FROM login_users where useremail = "'+req.body.useremail+'" and password="'+req.body.password+'"',function(err, rows, fields) {
				if (err) {
					req.flash('error', err)
					res.redirect('/');
				}else{
					//console.log(rows.length);
					if(rows.length == 0){
						conn.query('insert into login_users(useremail,password)values("'+req.body.useremail+'" ,"'+req.body.password+'")',function(err, response) {	
							
						});
						req.flash('success', 'Signup successful!')
						res.redirect('/');
					}else{
						req.flash('success', 'Already Registered! Please Login')
						res.redirect('/');
					}
				}
			})
		})
	}else {   
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
        res.render('user/edit', { 
            useremail: req.body.useremail,
			password: req.body.password
        })
    }

})

// SHOW EDIT USER FORM
app.get('/edit/(:isbn)', function(req, res, next){
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM books WHERE isbn = "'+req.params.isbn+'"', function(err, rows, fields) {
			if(err) throw err
			if (rows.length <= 0) {
				req.flash('error', 'Book Not found with ' + req.params.isbn)
				res.redirect('/users')
			}
			else { 
				res.render('user/edit', { 
					title 			: rows[0].title,
					isbn 			: rows[0].isbn,
					pagecount		: rows[0].pagecount,
					publishedDate	: rows[0].publishedDate,
					shortDescription: rows[0].shortDescription,
					status 			: rows[0].status,
					authors 		: rows[0].authors,
					categories		: rows[0].categories,
				})
			}			
		})
	})
})


module.exports = app

     // IMPORTING NODE MODULEs	
const express = require('express');  
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');		
const csrf = require('csurf');								

     // DEPLOYMENT PACKAGEs
const helmet = require('helmet');			    
const compression = require('compression');	    		          
     

     // IMPORTING our custom files (ROUTEs, CONTROLLERs, MODELs, ...)	
const env = require('./config/env');      

	// INITIATION of EXPRESS and VIEW ENGINE setting	
const app = express();
app.set('view engine', 'ejs');
// app.set('views', 'views');

	// CONSTANTs	
const transporter = nodemailer.createTransport(sendgrid({
     auth: {api_key: env.sendgridApiKey }
}));
     
     
     // MIDDLEWAREs     
     // MIDDLEWAREs for LOGGING   
     
     // MIDDLEWAREs for setting a STATIC folder - as a default one to use in views with src and href
app.use(express.static('./'));
     // app.use(express.static(path.resolve('./')));
     
     // PARSING MIDDLEWAREs for POST request inputs 
app.use(bodyParser.urlencoded({extended:false})); 
// app.use(bodyParser.json());
     
     // General SESSION and FLASH MIDDLEWAREs	

app.use(session({
     secret: env.sessionSecret, 						             
     resave: false, 	      
     saveUninitialized: false									           
}));						
app.use(flash());			                                                                      

	// USER AUTHENTICATION  MIDDLEWAREs
     // GLOBAL variables MIDDLEWARE - catching all pages and all categories (to be displayed in the navigation bars for every request)

     // GLOBAL variables MIDDLEWARE - using SESSION and FLASH - we can then use these variables in all views (responses)
app.use((req, res, next) => {                                               
     res.locals.message = req.flash('message');        		     
     next(); 
});				         	                  
     
     
	     // CSRF SETUP and CSRF MIDDLEWAREs                                       
	// If we have ROUTES that we want to be ignored by CSRF Middleware we need to set them above the CSRF Midd. function
	// CSRF MIDDLEWARE - all ROUTES below will be affected by CSRF Midd.
app.use(csrf());     
	// GLOBAL variables MIDDLEWARE for CSRF Token
app.use((req, res, next) => {  
	res.locals.csrfToken = req.csrfToken();       
	next();												     	    
});

     // MIDDLEWAREs for DEPLOYMENT
app.use(helmet());
app.use(compression());


     // Routes MIDDLEWAREs -> uvek idu na kraju middleware sekcije    
app.get('/', (req, res) => {
     res.render('index');
});

app.get('/download', (req, res) => {
     res.download(__dirname + '/resume().pdf');
});

app.post('/message', (req, res) => {
     console.log(req.body);
     const name = req.body.name;
     const email = req.body.email;
     const subject = req.body.subject;
     const message = req.body.message;
     transporter.sendMail({
          to: 'al_nikolic@yahoo.com',
          from: email,
          subject: name + ': ' + subject,
          html: message
     })
          .then(() => console.log('Email sent!'))
          .then(() => {
               req.flash('message', 
                    `<b><p>Thank you for contacting me ${name}!</p>
                    <p>I will get back to you shortly. &nbsp;
                    Best regards,</p>
                    Aleksandar</b>`);
               res.redirect('/#contact');
          })
          .catch(err => console.log(err));
});

     // Error handling MIDDLEWARE           

     // DB CONNECTION to APP. SERVER and STARTING the APP. SERVER			 
app.listen(process.env.PORT || 5000, () => {
     console.log('Server started!');
});
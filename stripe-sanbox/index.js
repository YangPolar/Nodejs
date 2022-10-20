const http = require('http');
const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const stripe = require('stripe')('sk_test_51LXLUcLePnA9FeujYz1eFLsuTnXYdSlByJwIColtfAtZnlZgw3TlOSjT0dlvqF4dmPQTOR0aek6HErxAE0IcC9aN00GnAGdeKY')

const app = express()
// create application/json parser
const jsonParser = bodyParser.json();

//app.use(express.static('public'))
app.use(express.static(__dirname + "/views"));

// View Engine Setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs')

const YOUR_DOMAIN = 'http://localhost:3000';
const Publishable_Key = 'pk_test_51LXLUcLePnA9FeujixRe35zoeaT71q80MsOwDRVfLdUZJhS1aeFMPGbWYfS5VSu9IVjqN9I1xvVmfHuRWVUNleQB00xVOpsmNO'
const Secret_Key = 'sk_test_51LXLUcLePnA9FeujYz1eFLsuTnXYdSlByJwIColtfAtZnlZgw3TlOSjT0dlvqF4dmPQTOR0aek6HErxAE0IcC9aN00GnAGdeKY'

app.get('/', function(req, res){
  res.write('Hello world');
  res.end();
})
app.get('/homepage', function(req, res){
    res.sendFile(__dirname + "/views/customized/checkout.html");
})
//****************************************Create Token*************************************************
// Step1: Create a new customer
app.get('/create_customer', function(req, res){
  // Moreover you can take more details from user
  // like Address, Name, etc from form
  console.log('create_customer: ' + req.query);
  stripe.customers.create({
    email: req.query.email,
    name: req.query.name,
    address: {
      line1: 'Near the sea',
      postal_code: '1040053',
      city: 'Tokyo',
      country: 'Japan',
    }
  })
      .then((customer) => {
        res.send(customer);
      })
      .catch((err) => {
        res.send(err)       // If some error occurs
      });
})

// Step2: Create a checkout session (checkout session id)
app.post('/create_checkout_session', jsonParser, function(req, res){
  console.log('create_checkout_session: ' + req.body.customer_id);
  stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: req.body.customer_id,
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
    }
  )
      .then((checkout) => {
        res.send(checkout);
      })
      .catch((err) => {
        res.send(err)       // If some error occurs
      });
})

// Step3: Retrieve a checkout session, you will have a url to input card info
app.post('/retrieve_checkout_session', jsonParser, function(req, res){
  console.log('retrieve_checkout_session: ' + req.body.checkout_session_id);
  stripe.checkout.sessions.retrieve(
      req.body.checkout_session_id
  )
      .then((setupIntent) => {
        res.send(setupIntent);
      })
      .catch((err) => {
        res.send(err)       // If some error occurs
      });
})

// to get callback from url
app.get('/success', function(req, res){
  // Moreover you can take more details from user
  // like Address, Name, etc from form
  console.log('success: ' + req.query.session_id);
  stripe.checkout.sessions.retrieve(
    req.query.session_id,
  )
      .then((checkoutSession) => {
        res.send(checkoutSession);
      })
      .catch((err) => {
        res.send(err)       // If some error occurs
      });
})

// Step4: Retrieve setupIntents
app.post('/retrieve_setupIntents', jsonParser, function(req, res){
  console.log('retrieve_setupIntents: ' + req.body.setupintents_id);
  stripe.setupIntents.retrieve(
      req.body.setupintents_id
  )
      .then((setupIntent) => {
        res.send(setupIntent);
      })
      .catch((err) => {
        res.send(err)       // If some error occurs
      });
})

// Step5: Attach a PaymentMethod to a Customer
app.post('/attach_payment_method', jsonParser, function(req, res){
  console.log('attach_payment_method: ' + req.body.payment_method);
  stripe.paymentMethods.attach(
      req.body.payment_method,
      {customer: req.body.customer_token}
  )
      .then((paymentMethod) => {
        res.send(paymentMethod);
      })
      .catch((err) => {
        res.send(err)       // If some error occurs
      });
})

// Step5: Attach a PaymentMethod to a Customer
app.post('/process_payment', jsonParser, function(req, res){
  console.log('process_payment: ' + req.body.payment_method);
  stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: req.body.currency,
      payment_method_types: ['card'],
      customer: req.body.customer_token,
      payment_method: req.body.payment_method,
      capture_method: req.body.capture_method,
      off_session: true,
      confirm: true,
  })
      .then((paymentIntents) => {
        res.send(paymentIntents);
      })
      .catch((err) => {
        res.send(err)       // If some error occurs
      });
})

app.post('/retrieve_payment', jsonParser, function(req, res){
    console.log('retrieve_payment: ' + req.body.payment_intent_id);
    stripe.paymentIntents.retrieve(
        req.body.payment_intent_id
    )
        .then((paymentIntent) => {
            res.send(paymentIntent);
        })
        .catch((err) => {
            res.send(err)       // If some error occurs
        });
})

app.post('/cancel_payment', jsonParser, function(req, res){
    console.log('cancel_payment: ' + req.body.payment_intent_id);
    stripe.paymentIntents.cancel(
        req.body.payment_intent_id
    )
        .then((paymentIntent) => {
            res.send(paymentIntent);
        })
        .catch((err) => {
            res.send(err)       // If some error occurs
        });
})
//****************************************Create Token END*************************************************

//**************************************** Payment by Stripe checkout *************************************************
app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: "price_1LXyIcLePnA9FeujvNzVxeQV",
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success.html`,
        cancel_url: `${YOUR_DOMAIN}/cancel.html`,
        automatic_tax: {enabled: true},
    });

    res.redirect(303, session.url);
});

app.post("/create-payment-intent", async (req, res) => {

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 100,
        currency: "jpy",
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});
//**************************************** Refund *************************************************
app.post('/refund', jsonParser, function(req, res){
    console.log('refund: ' + req.body.payment_method);
    stripe.refunds.create({
        payment_intent: req.body.payment_intent,
        amount: req.body.amount,
        reverse_transfer: req.body.reverse_transfer,
    })
        .then((refund) => {
            res.send(refund);
        })
        .catch((err) => {
            res.send(err)       // If some error occurs
        });
})
//**************************************** Customized add payment method flow *************************************************
// 1. Create customer
// 2. create setupIntent
app.post('/create_setupIntents', jsonParser, function(req, res){
    console.log('create_setupIntents: ' + req.body.customer_id);
    stripe.setupIntents.create({
            customer: req.body.customer_id,
            payment_method_types: ['card'],
        }
    )
        .then((checkout) => {
            res.send(checkout);
        })
        .catch((err) => {
            res.send(err)       // If some error occurs
        });
})

app.get('/get_client_secret', async (req, res) => {
    console.log('get_client_secret: ' + req.query.customer_id);
    const intent = stripe.setupIntents.create({
            customer: req.query.customer_id,
            payment_method_types: ['card'],
        }
    )
        .then((intent) => {
            console.log('intent.client_secret: ' + intent.client_secret);
            res.json({client_secret: intent.client_secret});
        })
        .catch((err) => {
            res.send(err)       // If some error occurs
        });
    //res.json({client_secret: intent.client_secret});
});

app.listen(3000, function(error){
  if(error) throw error
  console.log('Listening on port 3000...');
})


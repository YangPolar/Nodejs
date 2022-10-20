// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = Stripe("pk_test_51LXLUcLePnA9FeujixRe35zoeaT71q80MsOwDRVfLdUZJhS1aeFMPGbWYfS5VSu9IVjqN9I1xvVmfHuRWVUNleQB00xVOpsmNO");
const options = {
    clientSecret: 'seti_1Lc44NLePnA9FeujBXSejaWT_secret_MKjXEVBMQuLQ2VxiHbcgp8BmaiMEvde',
    // Fully customizable with appearance API.
    appearance: {/*...*/},
};

// Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 2
const elements = stripe.elements(options);

// Create and mount the Payment Element
const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element');

// Submit
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const {error} = await stripe.confirmSetup({
        //`Elements` instance that was used to create the Payment Element
        elements,
        confirmParams: {
            return_url: 'http://localhost:3000/success.html',
        }
    });

    if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Show error to your customer (for example, payment
        // details incomplete)
        const messageContainer = document.querySelector('#error-message');
        messageContainer.textContent = error.message;
    } else {
        // Your customer will be redirected to your `return_url`. For some payment
        // methods like iDEAL, your customer will be redirected to an intermediate
        // site first to authorize the payment, then redirected to the `return_url`.
    }
});

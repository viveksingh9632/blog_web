


// function checkForAuthenticationCookie(cookieName) {
//     return (req, res, next) => {
//         const tokenCookieValue = req.cookies[cookieName];
//         if (!tokenCookieValue) {
//             next(); // No authentication cookie, proceed to the next middleware
//         }

//         try {
//             const userPayload = validateToken(tokenCookieValue); 
//             req.user = userPayload; 
//         } catch (error) {
//             next(); 
//         }



//     };
// }

// module.exports = {
//     checkForAuthenticationCookie
// };


const { validateToken } = require('../services/auth.js');
console.log('validateToken:', validateToken);

function checkForAuthenticationCookie(cookieName) {
    return function (req, res, next) {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) {
            return next(); // No authentication cookie, proceed to the next middleware
        }

        try {
            const userPayload = validateToken(tokenCookieValue); // Validate the token
            req.user = userPayload; // Attach user payload to the request object
            return next(); // Proceed to the next middleware
        } catch (error) {
            console.error('Token validation failed:', error); // Log the error for debugging purposes
            return next(); // Invalid token, proceed to the next middleware
        }
    };
}

module.exports = {
    checkForAuthenticationCookie
};

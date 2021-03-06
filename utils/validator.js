let validator = require('validator');

exports.isValidEmail = function(res, email, optional){
	if (!optional && !email) {
	    return res.badRequest('Email is required');
	}
	if (!validator.isEmail(email)){
        return res.badRequest('Email is required');
    }
	return true;
};

exports.isValidPhoneNumber = function(res, phoneNumber, optional){
    if (!optional && !phoneNumber) {
        return res.badRequest('Phone Number is required');
    }
    if (!validator.isMobilePhone(phoneNumber, 'any')){
        return res.badRequest('Phone Number is not valid')
    }

    return true;
};

exports.isSentence = function(res, sentence, optional){
    if (!optional && !sentence) {
        return res.badRequest('A required field is missing');
    }
    if (typeof(sentence) !== 'string' || (sentence.trim().indexOf(' ') <= 0 || sentence.trim().length > 120 )){
        return res.badRequest('field value must be a string and must contain more than one word and less than 120 characters');
    }

    return true;
};

// exports.isBizCategory = function(res, category, optional){
//     let allowedCategories = ["event centre", "catering","pastries/cake design", "transportation", "entertainment",
//                             'decoration','dj','mc','comedy','make-overs', 'fashion', 'printing press','business centre',
//                             'grocery', 'security', 'jewelry', 'gift shops', 'event planning', 'ushering']
//     if (!optional && !category) {
//         return res.badRequest('category is required');
//     }
//     if (typeof(category) !== 'string' || allowedCategories.indexOf(category.toLowerCase()) < 0) {
//         return res.badRequest("category of business is required. Please select from the list given");
//     }
//
//     return true;
// };

exports.isWord = function(res, word, optional){
    if (!optional && !word) {
        return res.badRequest('A required field is missing');
    }
    if (typeof(word) !== 'string' ||  word.trim().length <= 0){
        return res.badRequest('field must be a string and cannot be empty');
    }

    return true;
};

exports.isCategory = function(res, cate_tags, optional){
    if (!optional && !cate_tags) {
        return res.badRequest('A category is field is required');
    }
    if (typeof(cate_tags) && !Array.isArray(cate_tags)){
        return res.badRequest('Tags should be a json array of user Ids (string)')
    }

    return true;
};

exports.isValidPassword = function(res, password, optional){
	if (!optional && !password) {
	    return res.badRequest('Password is required');
	}
	if (typeof(password) !== 'string' || password.length < 6){
	    return res.badRequest('Invalid password. Must be 6 or more characters')
	}

	return true;
};

exports.isFullname = function(res, name, optional){
	if (!optional && !name) {
	    return res.badRequest('Name is required');
	}

    let validName = /^[a-z,A-Z]([-']?[a-z,A-Z]+)*( [a-z,A-Z]([-']?[a-z,A-Z]+)*)+$/.test(name); //https://stackoverflow.com/questions/11522529/regexp-for-checking-the-full-name
    if (!validName){
        return res.badRequest('Name is not valid or complete. Provide name in full');
    }

	return true;
};

exports.isName = function(res, name, optional){
    if (!optional && !name) {
        return res.badRequest('Name is required');
    }

    let validName = /^[A-Za-z0-9_.'-]+(?:\s+[A-Za-z0-9_.'-]+)*$/.test(name); //https://stackoverflow.com/questions/11522529/regexp-for-checking-the-full-name
    if (!validName){
        return res.badRequest('Business Name is not valid. name must start with a letter Provide name in full');
    }

    return true;
};

exports.isUsername = function(res, username, optional){
    if (!optional && !username) {
        return res.badRequest('Username is required');
    }

    let validUsername = /^[a-zA-Z0-9_.-]{3,16}$/.test(username);
    if (!validUsername){
        return res.badRequest('Username is not valid please enter a valid username');
    }

    return true;
};

exports.isFile = function(res, file, optional){
    if (!optional && !file) {
        return res.badRequest('File to be uploaded is required');
    }

    if (typeof(file.path) !== 'string' || file.path.trim().length <= 0 ){
        return res.badRequest('File to be uploaded is required and must be string')
    }

    return true;
};

exports.isOverMinimumAge = function(res, d_o_b, optional){
	if (!optional && !d_o_b) {
	    return res.badRequest('Date of birth is required');
	}

	if (typeof(d_o_b) !== 'number'){
        return res.badRequest('Date of birth must be a valid timestamp (number)');
	}

	let today = new Date();
    let birthDate = new Date(parseInt(d_o_b));
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
	    age--;
	}

	if (age < 12){
		return res.badRequest('Minors cannot open accounts on one place. Minimum age requirement is 13 years');
	}

	return true;
};



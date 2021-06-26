const moment = require('jalali-moment');

exports.formatDate = date => {
    return moment(date).locale('en').format("YYYY-MM-DD");
        
        // 'fa').format("D MMM YYYY");
};
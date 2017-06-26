function createNewDate(){
    var currentDate = new Date();
    var dateTime =  currentDate.getDate() + "/"
    + (currentDate.getMonth()+1)  + "/"
    + currentDate.getFullYear() + " @ "
    + currentDate.getHours() + ":"
    + currentDate.getMinutes() + ":"
    + currentDate.getSeconds();
    return dateTime;

}

module.exports.createNewDate = createNewDate;

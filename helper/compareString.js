function compare(objSequenceA, objSequenceB) {
    let amountA = (amountB = 0);
    for (word in objSequenceA) {
        amountA += objSequenceA[word];
        amountB += objSequenceB[word]
            ? objSequenceB[word] >= objSequenceA[word]
                ? objSequenceA[word]
                : objSequenceB[word]
            : 0;
    }
    return Math.floor((100 * amountB) / amountA);
}

//hàm chuẩn hóa câu
function changeAlias(alias) {
    let str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(
        /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
        " "
    );
    str = str.replace(/ + /g, " ");
    str = str.trim();
    return str;
}

function stringToObjectSequence(str) {
    return str.split(" ").reduce((objSequence, word) => {
        objSequence[word] = objSequence[word] + 1 || 1;
        return objSequence;
    }, {});
}

let strA = "Lê Văn son"; //input từ app
let strB = "Hôm nay trên thao trường, tôi nằm trên tấm ván lẹ tuông rơi"; //chuỗi trong uniqueBook

//ví dụ
console.log(
    compare(
        stringToObjectSequence(changeAlias(strA)),
        stringToObjectSequence(changeAlias(strB))
    )
);

module.exports = {
    compare,
    stringToObjectSequence,
    changeAlias,
};

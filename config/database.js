var spicedPg = require('spiced-pg');
var password = require('./password')


// IS THAT OKAy ?
var dbUrl = process.env.DATABASE_URL ||`postgres:${password.id}:${password.password}@localhost:5432/petition`;
var db = spicedPg(dbUrl);



function signPetition(userId, signature){
    return new Promise(function(resolve, reject){
        const q = `INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2)
        RETURNING id, signature ;`
        ;

        if(signature == ""){
            signature = null;
        }

        const params = [userId || null, signature || null];
        return db.query(q, params).then(function(results){
            resolve(results);
        }).catch(function(e){
            reject(e);
        });
    })
}

function deletePetition(userId){
    return new Promise(function(resolve, reject){
        const q = `DELETE FROM signatures
        WHERE user_id = $1`
        ;

        const params = [userId];
        return db.query(q, params).then(function(results){
            resolve(results);
        }).catch(function(e){
            reject(e);
        });
    })
}

function addLikeForSingleImage(numberOfLikes, imageId) {

    let q = 'UPDATE images SET likes = $1 WHERE id = $2;';
    let params = [
        numberOfLikes,
        imageId
    ];
    return new Promise(function(resolve, reject) {
        db.query(q, params).then(function(results) {
            resolve(results);
        }).catch(function(err) {
            reject(err);
        });
    });

}





function getNameAndSignature(email){
    return new Promise(function(resolve, reject){
        const q = `SELECT signatures.id, signatures.signature, users.first_name, users.id
        FROM users
        JOIN signatures ON  users.id = signatures.user_id
        WHERE users.email = $1;`;
        const params = [email];

        return db.query(q, params).then(function(results){
            resolve(results)
        }).catch(function(e){
            reject(e);
        })
    })
}




function getSignature(id){
    return new Promise(function(resolve, reject){
        const q = `SELECT signature
        FROM signatures
        WHERE id = $1;`
        ;

        const thisID = [id];

        return db.query(q, thisID).then(function(results){
            resolve(results.rows[0]);
        }).catch(function(e){
            reject(e);
        });
    })
}


function register(firstName, lastName, email, password, date){
    return new Promise(function(resolve, reject){
        const q = `INSERT INTO users (first_name, last_name, email, password, create_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, first_name, last_name, email;`
        ;

        if(password == ""){
            password = null;
        }

        const params = [firstName || null, lastName || null, email || null, password || null, date || null];
        return db.query(q, params).then(function(results){
            resolve(results)
        }).catch(function(e){
            reject(e);
        });
    })
};

function login(email){
    return new Promise(function(resolve, reject){
        const q = `SELECT * FROM users WHERE email =$1;`
        ;

        if(password == ""){
            password = null;
        }

        const params = [email || null];
        return db.query(q, params).then(function(results){
            resolve(results.rows[0]);
        }).catch(function(e){
            reject(e);
        })
    })
}


function postProfile(userID , age, city, url){
    return new Promise(function(resolve, reject){
        const q = `INSERT INTO user_profiles (user_id, age, city, url)
        VALUES ($1, $2, $3, $4)
        RETURNING age, city, url, user_id ;`
        ;

        const params = [userID || null, age || null, city || null, url || null];
        return db.query(q, params).then(function(results){
            resolve(results);
        }).catch(function(e){
            reject(e);
        });
    })
};

function getProfiles(){
    return new Promise(function(resolve, reject){
        const q = `SELECT age, city, url FROM user_profiles ;`;
        return db.query(q).then(function(results){
            resolve(results);
        }).catch(function(e){
            reject(e);
        });
    })
}

function getCitizens(city){
    return new Promise(function(resolve, reject){
        const q = `SELECT users.last_name, users.first_name, user_profiles.age, user_profiles.url
        FROM users
        JOIN user_profiles ON users.id = user_profiles.user_id
        WHERE user_profiles.city = $1;`

        ;
        const params = [city];
        return db.query(q, params).then(function(results){
            resolve(results.rows);
        }).catch(function(e){
            reject(e);
        });
    })
}


function getSigners(){
    return new Promise(function(resolve, reject){
        const q= `SELECT users.last_name, users.first_name, user_profiles.age , users.id, user_profiles.user_id, user_profiles.city, user_profiles.url
        FROM users
        JOIN user_profiles ON users.id = user_profiles.user_id;`
        ;
        return db.query(q).then(function(results){
            resolve(results)
        }).catch(function(e){
            reject(e);
        });
    })
}

function hasSigned(email){
    return new Promise(function(resolve, reject){
        const q= `SELECT users.last_name, users.first_name, signatures.signature
        FROM users
        JOIN signatures ON users.id = signatures.user_id
        WHERE users.email = $1;`
        ;
        const params =  [email || null];
        return db.query(q, params).then(function(results){
            resolve(results)
        }).catch(function(e){
            reject(e);
        });
    })
}

function getProfile(email){

    return new Promise(function(resolve, reject){
        const q= `SELECT users.last_name, users.first_name, user_profiles.id, users.email, users.password, user_profiles.age, user_profiles.city ,user_profiles.url
        FROM users
        JOIN user_profiles ON users.id = user_profiles.user_id
        WHERE users.email = $1;`
        ;
        const params =  [email || null];
        return db.query(q, params).then(function(results){
            resolve(results)
        }).catch(function(e){
            reject(e);
        });
    })

}


function getCities(){
    return new Promise(function(resolve, reject){
        const q= `SELECT city
        FROM user_profiles;`
        ;
        return db.query(q).then(function(results){
            resolve(results)
        }).catch(function(e){
            reject(e);
        });
    })
}


function checkEditPageInfo(data, body, userID){
    return new Promise(function(resolve, reject){
        if(!data.id){
            const q= `INSERT INTO user_profiles (age, city, url, user_id)
            VALUES ($1, $2, $3, $4)`
            ;
            const params =  [body.age || null, body.city || null, body.homepage || null, userID || null];
            db.query(q, params).then(function(results){
                resolve(results);
            });
        }else {
            console.log("it will never exist");
            const q= `UPDATE user_profiles
            SET age = $1, city = $2, url = $3
            WHERE user_id = $4;`
            ;
            const params =  [body.age || null, body.city || null, body.homepage || null, userID || null];
            db.query(q, params).then(function(results){
                resolve(results);
            });
        }

    }).catch(function(e){
        reject(e);
    });
}

function checkRegisteringInfo(lastName, firstName, email, password, userId){
    return new Promise(function(resolve, reject){
        const q= `UPDATE users
        SET last_name = $1, first_name = $2, email = $3, password = $4
        WHERE id = $5
        RETURNING id,first_name, last_name, email;`
        ;
        const params =  [lastName, firstName, email, password, userId];
        db.query(q, params).then(function(results){
            resolve(results);
        }).catch(function(e){
            reject(e);
        });
    })
}


module.exports.deletePetition = deletePetition;
module.exports.getNameAndSignature = getNameAndSignature;
module.exports.getSignature = getSignature;
module.exports.register = register;
module.exports.login = login;
module.exports.postProfile = postProfile;
module.exports.getProfiles = getProfiles;
module.exports.getSigners = getSigners;
module.exports.hasSigned = hasSigned;
module.exports.getProfile = getProfile;
module.exports.getCities = getCities;
module.exports.getCitizens = getCitizens;
module.exports.checkEditPageInfo = checkEditPageInfo;
module.exports.checkRegisteringInfo = checkRegisteringInfo;
module.exports.signPetition = signPetition;
module.exports.likeImage = likeImage;

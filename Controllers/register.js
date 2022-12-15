const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if(!email || !password || !name){
      return  res.status(400).json('Oga enter something')
    }
    const hash = bcrypt.hashSync(password);
    // bcrypt.hash(password, null, null, function(err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });
    return db.transaction(trx=>{
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail=>{
         return trx('users')
        .returning('*')
        .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date()
        }).then(user => {
            res.json(user[0])
            //console.log(user[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('eyaah'))
}

module.exports = {
    handleRegister: handleRegister
};
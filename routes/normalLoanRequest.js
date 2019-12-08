var express = require('express');
var router = express.Router();
var conn = require('./connection');
var loan_Id = require('./generateLoanId');
var transaction_Id = require('./generateTransactionId');


router.get('/', function (req, res, next) {
    res.render('normalLoanRequest');

});



router.post('/', function (req, res) {
    let actNum = req.body.actNum;
    let repayPeriod = req.body.repayPeriod;
    let loanAmount = req.body.loanAmount;
    let empSector = req.body.empSector;
    let empType = req.body.empType;
    let profession = req.body.profession;
    let annualSalary = req.body.annualSalary;
    //let loanId = loan_Id();
    //let transactionId = transaction_Id();

    function updateDB() {
        conn.query(`INSERT INTO loan(loan_id,loan_amount,repayment_period,start_date,state,account_num) VALUES ('${loanId}','${loanAmount}','${repayPeriod}',curdate(),'1','${actNum}')`, function (err, result) {
            if (err) {
                res.send(err);
                res.send("unsuccessful in updating loan entity");
            } else {
                conn.query(`INSERT INTO normal_loan(loan_id,account_num,emp_sector,emp_type,profession,total_salary) VALUES ('${loanId}','${actNum}','${empSector}','${empType}','${profession}','${annualSalary}')`, function (err, result) {
                    if (err) {
                        res.send("unsuccessful in updating normal loan entity");
                    } else {
                        conn.query(`INSERT INTO transaction(transaction_id,date,time_transaction,account_num) VALUES ('${transId}',curdate(),curtime(),'${actNum}')`, function (err, result) {
                            if (err) {
                                res.send("unsuccessful in updating transaction entity");
                            } else {
                                conn.query(`INSERT INTO deposit(deposit_amount,transaction_id) VALUES ('${loanAmount}','${transId}')`, function (err, result) {
                                    if (err) {
                                        res.send("unsuccessful in updating deposit entity");
                                    } else {
                                        conn.query(`UPDATE account SET 'balance' =  'balance' + '${loanAmount}' WHERE account_num = '${actNum}'`, function (err, result) {
                                            if (err) {
                                                res.send("unsuccessful in updating balance column entity");
                                            } else {
                                                res.send("Successful in updating the db");
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });


    }


    function checkAccountNum() {
        conn.query(`SELECT account_num FROM account WHERE account_num = '${actNum}'`, function (err, result) {
            if (result.length != 0) {
                updateDB();
            } else {
                res.send("fucker");
            }
        });
    }

    function checkTransactionId() {
        transactionId = transaction_Id();
        conn.query('SELECT transaction_id FROM transaction WHERE transaction_id = ' + transactionId, (err, result) => {
            if (result.length != 0) {
                console.log(result.length);
                checkTransactionId();
            } else {
                console.log("check transaction complete...")
                checkAccountNum();
            }

        });

    }

    function checkLoanId() {
        loanId = loan_Id();
        conn.query('SELECT loan_id FROM loan WHERE loan_id = ' + loanId, (err, result) => {
            console.log(err)
            if (result.length != 0) {
                console.log(result.length);
                checkLoanId();
            } else {
                console.log("check loAN complete...");
                checkTransactionId();
            }
        });

    }



    checkLoanId();



});

module.exports = router;
const Question = require("../models/question");
const Answer = require("../models/answer");
const Option = require("../models/option");
const User = require("../models/user");
const Assigned = require("../models/assignedtasks");
let questionId;
let createMessage;
let fetchedUser ;
let option;
let answer;
let questions;
///assigned task creation
exports.createQuestion = async (req, res, next) => {
  console.log(req.body);
  console.log(req.body.email);
   option = new Option({
    option: req.body.option,
  });
   answer = new Answer({
    answer: req.body.answer
  });
   questions = new Question({
    question: req.body.question,
    optionId: option._id,
    answerId: answer._id,
    creator: req.userData.userId
  });
  console.log(req.body);

if(req.body.email=== ''){
  try {


    let info = await Promise.all([questions.save(), option.save(), answer.save() ]);

    console.log(info);
    res.status(200).send({
      info:info,
      message: "Question added successfully"
    })

  } catch(ex) {
    console.log(ex.message);
    res.status(400).send({ message: "cannot Upload"})
  }
}
else{
 console.log( questions._id);
 questionId= questions._id;
  next();
}


}
///get email id of the assigned task
exports.createAssigned =  (req, res, next)=>{
 console.log("this is fetchws", questionId);
  console.log(req.body.email);
  questionArray = [] ;
  questionArray.push(questionId);
  console.log(questionArray);
  User.findOne({ email: req.body.email })
  .then(user => {
    fetchedUser = user._id;
    console.log('userfindId', fetchedUser);
    assignedUser = new Assigned({
      assigner: fetchedUser,
      questionId:questionArray,
      creator:req.userData.userId,

    });
    let info =  Promise.all([questions.save(), option.save(), answer.save() ,assignedUser.save()]);
    res.status(200).send({
      message: "Assigned And Save the Question SuccessFully",
    });

  }).catch(error =>{
    res.status(200).send({
      message: " User  Not Found cannot process",
    });
  });


}
///create mutliple assigned task
exports.createMultiAssignedQuestion = (req, res,next) =>{
  console.log(req.body);
  User.findOne({ email: req.body.email })
  .then(user => {
    fetchedUser = user._id;
    console.log('userfindId', fetchedUser);
  const assignedUser = new Assigned({
      assigner: fetchedUser,
      questionId:req.body.questionId
    }).save().then(post =>{
      res.status(200).send({
        assigned:post,
        message: "Assigned the questions SuccessFully",
      });
    });
  //  console.log(assignedUser);
  }).catch(error =>{
    res.status(200).send({
      message: " User  Not Found cannot process",
    });
  });


}
/////GET question
exports.getQuestion = (req, res, next) =>{
  Question.find({creator:req.userData.userId}).populate('optionId').populate('answerId').then(question =>{
    if (question) {
      console.log(question);
      res.status(200).json({ question });
  } else {
      res.status(404).json({ message: "Couldnot get the Info" });
  }
  }).catch(error =>{
    res.status(500).json({
      message:"Getting question Failed"
    })
  })

}
/// GET ANSWER
exports.getAnswer = (req, res,next) => {
  Question.find({}).populate('answerId')
  .then(userInfo => {
      if (userInfo) {
          res.status(200).json({ info: userInfo });
      } else {
          res.status(404).json({ message: "Couldnot get the Info" });
      }
  })
  .catch(error => {
      res.status(500).json({
          message: "Getting UserInfo Failed"
      });
  });
}
/// GET option
exports.getOption = (req, res, next) => {
  Question.find({}).populate('optionId')
  .then(userInfo => {
      if (userInfo) {
          res.status(200).json({ info: userInfo });
      } else {
          res.status(404).json({ message: "Couldnot get the Info" });
      }
  })
  .catch(error => {
      res.status(500).json({
          message: "Getting UserInfo Failed"
      });
  });

}
//GET Question Array
exports.getArray = (req, res, next) => {
  console.log(req.body.question);
 // var list = ["5cbc7cc23d1d3a417ef51e74","5cbc7d0cf537ad4236e56d2d","5cbc7d5d65958b42ec4070dc","5cbc8d0445d5646d8aec3b51"];
  Question.find({ _id: {$in : req.body.question}}).populate('optionId')
  .then(userInfo => {
    if (userInfo) {
        res.status(200).json({ info: userInfo });
    } else {
        res.status(404).json({ message: "Couldnot get the Info" });
    }
})
.catch(error => {
    res.status(500).json({
        message: "Getting UserInfo Failed"
    });
});

}

///GET ASSIGNED With ANSWER
exports.getAssignedQuestion = (req, res, next) => {
  list= [[]];
Assigned.find({ assigner:"5cb46a3a58381b15e24f2537"}).then(result =>{
 result.forEach(function(element) {
   list.push(element.questionId);
 //  console.log(element.questionId);
 });
 User.find({_id:element.creator}).then(result =>{
  email = result[0].email;
var newArr = [];


for(var i = 0; i < list.length; i++)
{
   newArr = newArr.concat(list[i]);
}
Question.find({ _id: {$in : newArr}}).populate('optionId').populate('answerId')
.then(userInfo => {
 if (userInfo) {
     res.status(200).json({ info: userInfo,email:email });
 } else {
     res.status(404).json({ message: "Couldnot get the Info" });
 }
})
.catch(error => {
 res.status(500).json({
     message: "Getting UserInfo Failed"
 });
});

})
.catch(error => {
   res.status(500).json({
       message: "Getting UserInfo Failed"
   });
});

}).catch();




}




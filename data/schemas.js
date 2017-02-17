var Address = new Schema({
    city:		String,
    street:                 	String,
    houseNumber:	{type:Number, min:0},
    latitude:             	{type:Number, default:0},
    longitude:          {type:Number, default:0}
});

var Invite = new Schema({
    address:     {type:Address, required: true},
    startTime:  {type:Date, required: true},
    endTime:    {type:Date, required: true},
    date:             {type:Date, required: true},
    status:          {type:String, default:"waiting"},
    recurring:    Object,
    sitterID:       {type:Number, required: true},
    parentID:     {type:Number, required: true}
});

var Hours = new Schema({
    sunday:{
        start: {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    monday:{
        start: {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    tuesday:{
        start: {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    wednesday:{
        start: {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    thursday:{
        start: {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    friday:{
        start: {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    saturday:{
        start: {type:String, default:"0"},
        finish: {type:String, default:"0"}
    }
});

var Review = new Schema({
    parentID:    {type:Number, required: true},
    sitterID:       {type:Number, required: true},
    date:             {type:Date, required: true, default: Date.now},
    description:{type:String, required: true},
    rating:          {type:Number, required: true}
});

var Child = new Schema({
    allergies:          {type:[String], lowercase: true},
    specialNeeds: {type:[String], lowercase: true},
    Hobbies:          {type:[String], lowercase: true},
    schoolAddress: Address,
    expertise:        {type:[String], lowercase: true},
    age:                   {type:Number,required: true},
    name:               {type:String, required: true}
});

var User = new Schema({
    id:                    {type: Number, required: true, unique: true},
    email:             {type: String, required: true, unique: true},
    name :            {type:String, required: true},
    joinedTime:  {type: Date, default: Date.now },
    gender:          {type:String, required: true},
    profilePicture: String,
    coverPhoto:     String,
    age:                 {type:Number,required: true, min: 0},
    location:        String,
    address:         {type:Address,required: true},
    languages:     [String],
    timezone:       String,
    invites:            [Invite]
});

var Sitter = User.extend({
    rating:                      {type: Number, required: true, default: 0},
    education:        	     [String],
    personalityScore: {type: Number, required: true},
    minAge:                  {type: Number, required: true, default: 0},
    maxAge:                 {type: Number, required: true},
    currencyType:      String,
    hourFee:                {type: Number, required: true},
    workingHours:    Hours,
    availableNow:      {type: Boolean, required: true},
    experience:           {type: Number, required: true, default: 0},
    hobbies:                 [String],
    mobility:                {type: Number, required: true, default: false},
    specialNeeds:       [String],
    review:                   [Review]
});

var Parent = User.extend({
    partner: User,
    children: Child,
    maxPrice: Number,
    matches: [Sitter]
});

import {claude}
from "@/lib/claude";


export async function POST(req:Request){

const {message}
= await req.json();


const response =
await claude.messages.create({

model:"claude-3-5-sonnet-20240620",

max_tokens:500,

messages:[
{
role:"user",
content:message
}
]

});


return Response.json({

reply:
response.content[0].type==="text"
?
response.content[0].text
:
""

});

}

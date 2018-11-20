function Search(){
    var input, filter, ul, li, a, i;
    input = document.getElementById('inputS');
    filter = input.value.toUpperCase();
    ul = document.getElementById('ulS');
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++)
    {
        a = li[i].getElementsByTagName('a')[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1)
        {
            li[i].style.display = "";
        }
        else
        {
            li[i].style.display = "none";
        }
    }
}
var Member = [
"/restart",
"/reviveall",
"/resetkdall",
"/ban",
"/kick",
"/pause",
"/unpause",
"/close",
"/help"];
var Profile = ["./images/Chakung.png",
"./images/P_kaito.jpg",
"./images/P_may.jpg",
"./images/P_boat.jpg",
"./images/P_poom.jpg",
"./images/P_nice.jpg",
"./images/P_bank.jpg",
"./images/P_sora.jpg",
"./images/P_cristina.jpg",
"./images/"];
var ListD = ["Nick(ชื่อเล่น): ชา<br>Age(อายุ): 18<br>Gender(เพศ): ชาย<br>Joined: 18 July 2015",
"Nick(ชื่อเล่น): ไคโตะ<br>Age(อายุ): 18<br>Gender(เพศ): ชาย<br>Joined: 2 May 2018",
"Nick(ชื่อเล่น): เมย์<br>Age(อายุ): 18<br>Gender(เพศ): หญิง<br>Joined: N/A",
"Nick(ชื่อเล่น): โบ๊ท<br>Age(อายุ): 16<br>Gender(เพศ): ชาย<br>Joined: N/A",
"Nick(ชื่อเล่น): ภูมิ<br>Age(อายุ): 15<br>Gender(เพศ): ชาย<br>Joined: N/A",
"Nick(ชื่อเล่น): ไนท์<br>Age(อายุ): 14<br>Gender(เพศ): ชาย<br>Joined: N/A",
"Nick(ชื่อเล่น): แบงค์<br>Age(อายุ): 13<br>Gender(เพศ): ชาย<br>Joined: N/A",
"Nick(ชื่อเล่น): กั๋วห่าว<br>Age(อายุ): 13<br>Gender(เพศ): ชาย<br>Joined: N/A",
"Nick(ชื่อเล่น): อมาเดอุส(AI)<br>Age(อายุ): 17<br>Gender(เพศ): หญิง<br>Joined: N/A"]
window.onload = function (){
var ulSearch = document.getElementById('ulS');
var ulA, m , list;
for (m = 0; m < Member.length; m++)
{
    ulA = document.createElement("A");
    ulA.innerHTML = Member[m];
    ulA.title = ListD[m];
    ulA.src = Profile[m];
    ulA.style.backgroundImage = "url('" + Profile[m] + "')";
    list = document.createElement("LI");
    list.appendChild(ulA);
    ulSearch.appendChild(list);
}
var modal = document.getElementById('modal');
var profilePic = document.getElementById('profile');
var name = document.getElementById('name');
var listL = document.getElementsByTagName('li');
var listA = document.getElementsByTagName('a');
var i;
window.onclick = function(event){
    if (event.target == modal) {
		CloseModal();
    }
}
for (i = 0; i < Member.length; i++)
{
    listA[i].onclick = function(){
        if (listA[i] == Member[i])
        {
            modal.style.display = "block";
            profilePic.src = this.src;
            name.innerHTML = this.innerHTML;
            data.innerHTML = this.title;
        }
    }
}

function CloseModal(){
    modal.style.display = "none";
}

var close = document.getElementById('close');
close.onclick = function(event){
    if (event.target == this) {
		CloseModal();
    }
}

}
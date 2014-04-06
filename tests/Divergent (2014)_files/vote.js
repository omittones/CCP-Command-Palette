/*
    vote.js
    records a user-submitted star rating
    and performs the ratings UI stuff.
*/
var hasVoted = false;
function vote(v) {
  if (!document.getElementById) return true;
  var voteOuter = document.getElementById('tn15rating');
  var spoilerDiv = document.getElementById('tn15plotkeywords');
  var personal_voting_stars = document.getElementById('personal-voting-stars');

  var width = parseInt((v == 'X') ? __vrtg : v) * 20 + 'px';
  personal_voting_stars.style.width = width;

  document.getElementById('voteuser').innerHTML = v;

  var u = voteOuter.className.match(/unrated/) ? ' unrated' : '';
  voteOuter.className = ((v == 'X') ? 'two user delete' : 'two user save') + u;
  var i = new Image();
  i.onload = function() { 
      voteOuter.className = ((v == 'X') ? 'one user' : 'two user') + u;
      if (spoilerDiv) { spoilerDiv.className = ''; }
  };
  i.onerror = function() { voteOuter.className = 'two error' + u; };
  i.src = 'vote?i='+v+';k=' + __vkey;

  hasVoted = true;
  return false;
}

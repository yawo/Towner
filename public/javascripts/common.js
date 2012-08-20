var collations={
    a:['a','à','â','ä','á','A','Á','ă','Ă','Â','å','Å','À','Ä','ā','Ā','æ','Æ'],
    b:['b','B'],    
    c:['c','ç','Ç','C'],
    d:['d','D'],
    e:['e','é','è','ê','ë','É','È','Ê','Ë','Ẽ','ē','Ē','E'],
    f:['f','F'],
    g:['g','G'],
    h:['h','H'],
    i:['i','ï','I','Ï','î','Î'],
    j:['j','J'],
    k:['k','K'],
    l:['l','L'],
    m:['m','M'],
    n:['n','ñ','N','ń','ǹ','Ǹ','Ñ','Ń'],
    o:['o','ô','ö','ò','ó','Ó','Ò','Ô','Ö','ø','Ø','Õ','œ','Œ','O'],
    p:['p','P'],
    q:['q','Q'],
    r:['r','R'],
    s:['s','S'],
    t:['t','T'],
    u:['u','ù','Ù','û','Û','ů','Ů','ü','Ü','ũ','Ũ','ū','Ū','U'],
    v:['v','V'],
    w:['w','W'],
    x:['x','X'],
    y:['y','Y'],
    z:['z','Z']
};

var mapper={}; 

function buildMapper(){
    for(var letter in collations){
        for(var i=0;i<collations[letter].length;i++){
            mapper[collations[letter][i]] = "['"+collations[letter].join("','")+"']";
        }
    }
    //console.log("mapper",mapper);
}
buildMapper();

function collateRegex(str){
    var res = "";
    for(var i=0;i<str.length;i++){
        res+=(mapper[str[i]])?mapper[str[i]]:str[i];
    }
   // console.log(str," collateRegex is ",res);
    return res;
}
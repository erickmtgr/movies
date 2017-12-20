var db = null;

function init(){
    
    document.getElementById("favbutton").addEventListener("click", function(){
        $.mobile.navigate( "#page3" );
        favList();
    });
    
    document.getElementById("homebutton").addEventListener("click", function(){
        $.mobile.navigate( "#page1" );
        getMoviesListAndDrawList()
    });
    
    db = window.sqlitePlugin.openDatabase({name: 'demo.db', location: 'default'});
    
    db.sqlBatch([
    'CREATE TABLE IF NOT EXISTS favoritesTable (id, title, release_date, mark, img_src, description)',
  ], function() {
    console.log('TODO HA SALIDO BIEN');
  }, function(error) {
    console.log('SQL batch ERROR: ' + error.message);
  });

    getMoviesListAndDrawList();
    
}

//////////////////////////////////////////////////////////////
function getMovieAndDrawDetail(id){
    //alert("has entrado a la funcion y la id es:" +id);
     var request = $.ajax({
         url: "https://api.themoviedb.org/3/movie/"+id+"?api_key=4da6b895870b2ff644982b6a5b10f5d8",
         method: "GET"
        });
    
        request.done(function( result ) {      
            $.mobile.navigate( "#page2" );
            var listdetails = $("#detailsContent");
            var detailsHeader = $("#detailsHeader");
            listdetails.empty();
            detailsHeader.empty();
            detailsHeader.append("<h2>"+result.original_title+"</h2><br>");
            listdetails.append("<img src=https://image.tmdb.org/t/p/w500"+result.poster_path+" height='300px'>");
            listdetails.append("<h3>Release: "+result.release_date+"</h3>");
            listdetails.append("<p>Note: "+result.vote_average+"</p>");
            listdetails.append("<p>"+result.overview+"</p>");
            listdetails.append("<button><a href=javascript:addFav("+result.id+")>Add to favorites</a></button");
            
            return result;
            
            listdetails.listview("refresh");
            detailsHeader.listview("refresh");
        });

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
}


//////////////////////////////////////////////////////////////
function getMoviesListAndDrawList(){
    var theList = $("#mylist");

    var request = $.ajax({
          url: "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=62d65865aa3654006c3d5c77f9999610",
          method: "GET"
    });

        request.done(function( moviesList ){
            
            for (i=0;i<moviesList.results.length;i++){
                theList.append(" <li><a href=javascript:getMovieAndDrawDetail("+moviesList.results[i].id+")><img src=https://image.tmdb.org/t/p/w500"+moviesList.results[i].poster_path+"><h2>"+moviesList.results[i].original_title+"</h2><p>Vote average: "+moviesList.results[i].vote_average+"</p></a></li>");  
                }
            
            theList.listview("refresh");
            });
        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
}




//////////////////////////////////////////////////////////////
function addFav(id){
    //alert("Has entrado y la id de la peli es: "+id);
    var request = $.ajax({
         url: "https://api.themoviedb.org/3/movie/"+id+"?api_key=4da6b895870b2ff644982b6a5b10f5d8",
         method: "GET"
        });
    
     request.done(function( result ) {
         alert('Added to Favorites');
         db.sqlBatch([
                [ 'INSERT INTO favoritesTable VALUES (?, ?, ?, ?, ?, ?)', [result.id, result.title, result.rrelease_date, result.vote_average, result.poster_path, result.overview] ]
              ], function() {
                console.log('INSERCIÓN OK');
              }, function(error) {
                console.log('SQL batch ERROR: ' + error.message);
         });
     });
    request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    })
}


//////////////////////////////////////////////////////////////
function favList(){
    
    db.executeSql('SELECT * FROM favoritesTable', [], function(rs) {
             console.log(JSON.stringify(rs));
        var favList = $("#favlist");
                favList.empty();
                
             for (i=0;i<rs.rows.length;i++){
   
                favList.append("<li data-icon='delete'><a href=javascript:MovieDetailFav("+rs.rows.item(i).id+")><img src=https://image.tmdb.org/t/p/w500"+rs.rows.item(i).img_src+"><h2>"+rs.rows.item(i).title+"</h2><p>Vote average: "+rs.rows.item(i).mark+"</p></a> <a href=javascript:deleteFav("+rs.rows.item(i).id+") data-position-to='window' data-transition='pop'>Purchase album</a></li>");
             }
        favList.listview("refresh");
                }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
});
}


//////////////////////////////////////////////////////////////

function deleteFav(id){

    db.executeSql('DELETE FROM favoritesTable WHERE id ='+id+'', [], function(rs) {
                var favList = $("#favlist");
                favList.listview("refresh");
             alert('Deleted from Favorites');
             console.log(JSON.stringify(rs));
        
                }, function(error) {
                console.log('SELECT SQL statement ERROR: ' + error.message);
});
    
}

//////////////////////////////////////////////////////////////
function MovieDetailFav(id){
    //alert("has entrado a la funcion y la id es:" +id);
     var request = $.ajax({
         url: "https://api.themoviedb.org/3/movie/"+id+"?api_key=4da6b895870b2ff644982b6a5b10f5d8",
         method: "GET"
        });
    
        request.done(function( result ) { 
            
            $.mobile.navigate( "#page2" );
            var listdetails = $("#detailsContent");
            var detailsHeader = $("#detailsHeader");
            listdetails.empty();
            detailsHeader.empty();
            detailsHeader.append("<h2>"+result.original_title+"</h2><br>");
            listdetails.append("<img src=https://image.tmdb.org/t/p/w500"+result.poster_path+" height='300px'>");
            listdetails.append("<h3>Release: "+result.release_date+"</h3>");
            listdetails.append("<p>Note: "+result.vote_average+"</p>");
            listdetails.append("<p>"+result.overview+"</p>");
            listdetails.append("<button><a href=javascript:deleteFav("+result.id+")>Delete from favorites</a></button");
            
            return result;
            
            listdetails.listview("refresh");
            detailsHeader.listview("refresh");
        });

        request.fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
    });
}
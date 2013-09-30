var audioElement = document.getElementById('stream'),
        volume = $('#volume');

var catalogue = {};
var playlist = [];
volume.change(function(){
    volumeLevel = volume.val() / 100;
    audioElement.volume = volumeLevel;
    volume.attr('title', Math.floor(volumeLevel*10));
    $('.volume-level').text(Math.floor(volumeLevel*10));
});

function fill_playlist(){
    $('#playlist').empty();
    for(key in playlist){
        var playlist_item = playlist[key];
        var song = catalogue[playlist_item.catalogue_key];
        $('#playlist').append('<div class="song padding" data-song="' + playlist_item.playlist_key + '"><h5 class="remove">X</h5><h5>' + song.metadata.title + '<br /><small>' + song.metadata.artist + '</small><br /><small>Duration: ' + moment(song.duration*1000).format('mm:ss') + '</small></h5></div>');
    }
}

var socket = io.connect('http://' + window.location.hostname);
socket.on('init', function(data) {
    $('.catalogue .playlist-inner').empty();
    playlist = data.playlist;
    catalogue = data.catalogue;
    fill_playlist();
    for(key in catalogue){
        var song = data.catalogue[key];
        $('#catalogue').append('<div class="song padding" data-song="' + key + '"><h5>' + song.metadata.title + '<br /><small>' + song.metadata.artist + '</small><br /><small>Duration: ' + moment(song.duration*1000).format('mm:ss') + '</small></h5></div>');
    }
});

$('#catalogue').on('click', '.song',function(){
    socket.emit('add_song', $(this).attr('data-song'));
});

socket.on('add_to_playlist', function(data){
    playlist.push(data);
    fill_playlist();
});

$('#playlist').on('click', '.song h5', function(){
    var song_id = $(this).parent().attr('data-song');
    socket.emit('remove_song', song_id);
});

socket.on('remove_from_playlist', function(playlist_item_id){
    playlist.forEach(function(val, key){
        var playlist_item = playlist[key];
        if(playlist_item.playlist_key == playlist_item_id){
            playlist.splice(key, 1);
        }
    });
    fill_playlist();
});

socket.on('now_playing', function(catalogue_key){
    var song = catalogue[catalogue_key];
    if(song == undefined){
        $('#now_playing_title').text("");
        $('#now_playing_artist').text("");
        $('#now_playing_album').text("");
    }
    else{
        $('#now_playing_title').text(song.metadata.title);
        $('#now_playing_artist').text(song.metadata.artist);
        $('#now_playing_album').text(song.metadata.album);
    }
});
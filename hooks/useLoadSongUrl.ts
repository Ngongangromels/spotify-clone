import { Song } from "./../types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const useLoadSongUrl = (songs: Song) => {
  const SupabaseClient = useSupabaseClient();

  if (!songs) {
    return "";
  }

  const { data: SongData } = SupabaseClient
    .storage
    .from('songs')
    .getPublicUrl(songs.song_path);

  return SongData.publicUrl;
};

export default useLoadSongUrl;

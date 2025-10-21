import { ReactNode, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

import { INITIAL_DETAIL_STATE } from "src/constant";
import createSafeContext from "src/lib/createSafeContext";
import { useGetAnimeDetailQuery, useGetAnimeEpisodesQuery } from "src/store/slices/hiAnimeApi";
import { AnimeDetail, EpisodeList } from "src/types/Anime";

interface DetailType {
  id?: string;
}
export interface DetailModalConsumerProps {
  detail: { animeDetail?: AnimeDetail; episodes?: EpisodeList } & DetailType;
  setDetailType: (newDetailType: DetailType) => void;
}

export const [useDetailModal, Provider] =
  createSafeContext<DetailModalConsumerProps>();

export default function DetailModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const [detail, setDetail] = useState<
    { animeDetail?: AnimeDetail; episodes?: EpisodeList } & DetailType
  >(INITIAL_DETAIL_STATE);

  const handleChangeDetail = useCallback(
    async (newDetailType: { id?: string }) => {
      if (newDetailType.id) {
        setDetail({ id: newDetailType.id });
      } else {
        setDetail(INITIAL_DETAIL_STATE);
      }
    },
    []
  );

  useEffect(() => {
    setDetail(INITIAL_DETAIL_STATE);
  }, [location.pathname, setDetail]);

  return (
    <Provider value={{ detail, setDetailType: handleChangeDetail }}>
      {children}
    </Provider>
  );
}

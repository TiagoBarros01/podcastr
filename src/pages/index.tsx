/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { api } from '../services/api';
import {
  AllEpisodes,
  HomePage,
  LatestEpisodes,
  EpisodeDetails,
} from '../styles/pages/home';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

interface Episode {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: string;
  durationAsString: string;
  url: string;
}
interface HomeProps {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  return (
    <HomePage>
      <LatestEpisodes>
        <h2>Last releases</h2>

        <ul>
          {latestEpisodes.map(
            ({
              id,
              title,
              thumbnail,
              members,
              publishedAt,
              durationAsString,
            }) => (
              <li key={id}>
                <Image
                  width={192}
                  height={192}
                  src={thumbnail}
                  alt={title}
                  objectFit="cover"
                />

                <EpisodeDetails>
                  <Link href={`/episodes/${id}`}>
                    <a>{title}</a>
                  </Link>
                  <p>{members}</p>
                  <span>{publishedAt}</span>
                  <span>{durationAsString}</span>
                </EpisodeDetails>

                <button type="button">
                  <img src="/play-green.svg" alt="Play episode" />
                </button>
              </li>
            ),
          )}
        </ul>
      </LatestEpisodes>
      <AllEpisodes>
        <h2>All episodes</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th />
              <th>Podcast</th>
              <th>members</th>
              <th>Date</th>
              <th>Duration</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map(({
              id, thumbnail, title, durationAsString, members, publishedAt,
            }) => (
              <tr key={id}>
                <td style={{ width: 72 }}>
                  <Image
                    width={120}
                    height={120}
                    src={thumbnail}
                    alt={title}
                    objectFit="cover"
                  />
                </td>
                <td>
                  <Link href={`/episodes/${id}`}>
                    <a>{title}</a>
                  </Link>
                </td>
                <td>{members}</td>
                <td style={{ width: 100 }}>{publishedAt}</td>
                <td>{durationAsString}</td>
                <td>
                  <button type="button">
                    <img src="/play-green.svg" alt="Play episode" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AllEpisodes>
    </HomePage>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes?', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc',
    },
  });

  const episodes = data.map((episode) => ({
    id: episode.id,
    title: episode.title,
    thumbnail: episode.thumbnail,
    members: episode.members,
    publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
      locale: ptBR,
    }),
    duration: Number(episode.file.duration),
    durationAsString: convertDurationToTimeString(
      Number(episode.file.duration),
    ),
    url: episode.file.url,
  }));

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  };
};

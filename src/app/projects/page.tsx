"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
// @ts-ignore
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";

import "@splidejs/react-splide/css";

const PROJECTS = [
  {
    id: 1,
    name: "cook.io",
    description: `A recipe finding website that allows users to search for recipes by name, ingredients, or cuisine. Built using HTML, CSS, and Vanilla JavaScript. This was my first project after learning JavaScript.`,
    link: "https://alienxviking.github.io/cookio/",
    images: [
      "/assets/projects-screenshots/cook.io/1.png",
      "/assets/projects-screenshots/cook.io/2.png",
      "/assets/projects-screenshots/cook.io/3.png",
      "/assets/projects-screenshots/cook.io/4.png",
    ],
  },
  {
    id: 2,
    name: "tidymind",
    description: `TidyMind is a web application that helps users declutter their minds and stay organized. 
            It is built using Electron JS, HTML, CSS, React and Node JS. It is an Electron Application so it won't work on the web, but only when installed locally in the device. `,
    link: "https://tidymind-final.vercel.app/",
    images: [
      "/assets/projects-screenshots/tidymind/1.png",
      "/assets/projects-screenshots/tidymind/2.png",
      "/assets/projects-screenshots/tidymind/3.png",
      "/assets/projects-screenshots/tidymind/4.png",
      "/assets/projects-screenshots/tidymind/5.png"
    ],
  },
  {
    id: 3,
    name: "Portfolio",
    description: `Welcome to my digital playground, where creativity meets code in the
            dopest way possible.`,
    link: "https://snehangshu-roy-portfolio.vercel.app/",
    images: [
      "/assets/projects-screenshots/myportfolio/landing.png",
      "/assets/projects-screenshots/myportfolio/navbar.png",
      "/assets/projects-screenshots/myportfolio/skills.png",
    ],
  },
  {
    id: 4,
    name: "Chess Game",
    description: `A smooth chess experience having both the option to play local multiplayer as well as against ai. Stockfish API was used to set 3 difficulty levels.`,
    link: "https://github.com/alienxviking/chess-pygame",
    images: [
      "/assets/projects-screenshots/chess/1.png",
      "/assets/projects-screenshots/chess/2.png",
      "/assets/projects-screenshots/chess/3.png",

    ],
  },
];
function Page() {
  return (
    <>
      <div className="container mx-auto md:px-[50px] xl:px-[150px] text-zinc-300 h-full">
        <h1 className="text-4xl mt-[100px] mb-[50px]">Projects</h1>
        <ul className="grid  md:grid-cols-2 lg:grid-cols-3 gap-10 place-content-around ">
          {PROJECTS.map((project) => (
            <li
              className="w-[300px] h-[400px] border-[.5px] rounded-md border-zinc-600"
              key={project.id}
              style={{ backdropFilter: "blur(2px)" }}
            >
              <div className="h-[200px]">
                <Splide
                  options={{
                    type: "loop",
                    interval: 3000,
                    autoplay: true,
                    speed: 2000,
                    perMove: 1,
                    rewind: true,
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                    arrows: false,
                  }}
                  aria-label="My Favorite Images"
                >
                  {project.images.map((image) => (
                    <SplideSlide key={image}>
                      <Image
                        src={image}
                        alt={`screenshot of "${project.name}`}
                        className="w-[300px] h-[200px] rounded-md bg-zinc-900 "
                        width={300}
                        height={400}
                        style={{ height: "200px" }}
                      />
                    </SplideSlide>
                  ))}
                </Splide>
              </div>
              <div className="p-4 text-zinc-300">
                <h2 className="text-xl">{project.name}</h2>
                <p className="mt-2 text-xs text-zinc-500">
                  {project.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Page;

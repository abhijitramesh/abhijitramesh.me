import Timeline from '../components/Timeline';
import Container from '../components/Container';
import BlogPost from '../components/BlogPost';
import Subscribe from '../components/Subscribe';
import ProjectCard from '../components/ProjectCard';
import { useState } from 'react';

const Divider = () => {
  return (
    <div className="dark:border-gray-600 w-full my-4" />
  );
};

export default function Home() {
  const [isShowingFullProjects, showFullProject] = useState(false);
  return (
    <Container>
      <div className="flex flex-col justify-center items-start max-w-2xl mx-auto mb-16">
        <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4 text-black dark:text-white">
          Hey, this is Abhijit Ramesh
        </h1>
        <h2 className="text-gray-600 dark:text-gray-400 mb-16">
          I'm a developer, I live mostly on the internet learning and building solutions using Machine Learning otherwise I would be working out or attending classes. 
          The best feeling in the world for me is when my code comes to life to serve purpose and make the lives of others easy.
        </h2>
       <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-4 text-black dark:text-white">
          Most Popular
        </h3>
        <BlogPost
          title="Part 1 : Learning Hands-on Machine Learning with Scikit-learn Keras and Tensorflow"
          summary="Notes on The Machine Learning Landscape"
          slug="part1-learning-hands-on-machine-leanring-with-scikit-learn-keras-and-tensorflow"
        />
        <BlogPost
          title="Part 1 : Following along MIT intro to deep learning"
          summary="An Intro to Deep Learning"
          slug="part1-following-along-mit-intro-to-deep-learning"
        />
        <BlogPost
          title="Part 2 : Learning Hands-on Machine Learning with Scikit-learn Keras and Tensorflow"
          summary="Notes on End to End Machine Learning"
          slug="part2-learning-hands-on-machine-leanring-with-scikit-learn-keras-and-tensorflow"
        />
        <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-4 mt-8 text-black dark:text-white">
          Projects
        </h3>
        <ProjectCard
          title="Semantic Similairy"
          description="State of the art implementation of sematic similarity using T5 using SNLI corpus of Stranford."
          href="https://github.com/abhijitramesh/semantic-similarity"
          icon='sematicsimilariy'
        />
        <ProjectCard
          title="tableQA"
          description="AI Tool for querying natural language on tabular data. TableQA uses huggingface transformers under the hood"
          href="https://github.com/abhijitramesh/tableQA"
          icon="tableqa"
        />
        <ProjectCard
          title="Psycic - CCTV"
          description="A video analysis tool which can analyse low quality video from CCTV footage which can enhance video quality using super resolution. The tool also provides features to extract objects using YOLO and split background audio to do forensics"
          href="https://github.com/Fireboltz/Psychic-CCTV"
          icon="psycicctv"
        />
        <ProjectCard
      title="Mifos Mobile CN"
      description="Client-facing banking app on top of Apache Fineract CN. This app provides banking services to places in the world that are underbanked."
      icon="android"
    />
             {isShowingFullProjects ? (
               <div>
      <ProjectCard
      title="NAV-FT"
      description="This project was done as part of IEEE Govt Tech Thon 2020 where my team and I developed anAndroid application which automates the process of Vehicle Fitness testing,
       This projects allowsthe Government Officials to access all the forms which are required for filling of the test in theremobile device follow automatic or manual assessment and generate certificates which can be sharedto the respective users.
       Some of the automation that we have added is using video to determinethe condition of the breaks of the car and using images to predict the condition of tyres."
      href="https://github.com/Fireboltz/NAV-FT"
      icon="navft"
    />
    <Divider />
    <ProjectCard
          title="Malwaric"
          description="This is an tool which helps in predicting if an Android Application is malicious or not. 
          The permissions of the applications are extracted and embedded which is then fed into a model which is trained on thousands of application which are malicious and benign.
           The model predicts fromthe pattern it knows if the application is malicious or not."
          href="https://github.com/Fireboltz/Malwaric"
          icon="malwaric"
        />
        <Divider />
        <ProjectCard
          title="Dexify"
          description="Dexify is a de-addiction and a community mental health tracking app. 
          It has the ability to monitorone’s mood and day to day activities. 
          It does not just stops with tracking it but also helps toimprove the mood of the user and keep them positive and motivated."
          href="https://github.com/Fireboltz/dexify"
          icon="dexify"
        />
        <Divider />
        <ProjectCard
          title="Teaching a Quad-Copter how to fly"
          description="This project leverages Reinforcement Learning to train an agent which teaches a quadcopter howto fly on its own. The agent uses actor-critic method and Deep-Q learning with policy search toteach the quadcopter"
          href="https://gitlab.com/abhijitramesh/teaching-a-quadcopter-how-to-fly"
          icon="drone"
        />
        <Divider />
        <ProjectCard
          title="Sentiment Analysis on IMDb deployed in AWS SageMaker"
          description="A sentiment analysis model completely build on PyTorch trained on IMDb database is deployed inAWS Sagemaker and a front-end website is also deployed for users to do inference."
          href="https://gitlab.com/abhijitramesh/sagemaker_deployment"
          icon="emotion"
        />
        <Divider />
        <ProjectCard
          title="Celebrity Face Generator"
          description="This repository contains multiple GAN experimentations that I have done looks at differentarchitectures and understanding there working also training and creating new Image data usingthese techniques."
          href="https://github.com/abhijitramesh/GAN-under-the-hood"
          icon="gan"
        />
        <Divider />
        <ProjectCard
          title="Attention"
          description="Attention is one of the most celebrated applications in the field of deep learning.
           Mimicking how the human brain perceives the world to computer vision."
          href="https://github.com/abhijitramesh/Attention"
          icon="attention"
        />
        <Divider />
        <ProjectCard
          title="TV Script Generation"
          description="A LSTM based model which is trained on Seinfeld TV scripts which generates new scripts.
          The model is implemented using LSTM and word2vec embedding."
          href="https://gitlab.com/abhijitramesh/tv_script_generation"
          icon="script"
        />
        <Divider />
        <ProjectCard
          title="Auto-Encoders"
          description="Auto-Encoders are Neural Networks that learns how to efficiently encode a data and then also howto reconstruct this data back to something as similar as the original data."
          href="https://github.com/abhijitramesh/Auto-Encoders"
          icon="encoder"
        />
        <Divider />
        <ProjectCard
          title="Asha SOS"
          description="This is a project for disaster management in case of floods. In case of floods, due to loss of activeinternet connection or network, people are not able to send for help. This project creates a energyefficent mesh network in the affected area allowing nearby devices to connect to this WiFi andupon human interaction would send an SOS signal to the base nearby"
          href="https://github.com/kochi-hackathon/AshaSOS"
          icon="sos"
        />
        <Divider />
        <ProjectCard
          title="Fineract Mobile CN"
          description="Staff side banking application build on top of Fineract CN"
          href="https://github.com/apache/fineract-cn-mobile"
          icon="android"
        />
        </div>
      ) : (
        <button
          type="button"
          className="flex items-center text-sm my-4 mx-auto px-4 py-2 rounded-md font-medium text-gray-900 dark:text-gray-100"
          onClick={() => showFullProject(true)}
        >
          See More
          <svg
            className="h-4 w-4 ml-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
        <Timeline />
        <Subscribe />
      </div>
    </Container>
  );
}

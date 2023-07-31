FROM ubuntu:22.04 AS base

# Install node
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install --global yarn

FROM base AS builder

# Install dependencies for Ubuntu
RUN apt-get install -y \
    libtiff-dev libgeotiff-dev libgdal-dev \
    libboost-system-dev libboost-thread-dev libboost-filesystem-dev libboost-program-options-dev libboost-regex-dev libboost-iostreams-dev libtbb-dev \
    git cmake build-essential wget

WORKDIR /opt

# install LAStools
RUN git clone https://github.com/m-schuetz/LAStools.git && cd LAStools/LASzip && mkdir build && cd build && \
    cmake -DCMAKE_BUILD_TYPE=Release .. && make && make install && ldconfig

# install PotreeConverter
RUN git clone -b develop https://github.com/potree/PotreeConverter.git && cd PotreeConverter && mkdir build && cd build && \
    cmake -DCMAKE_BUILD_TYPE=Release -DLASZIP_INCLUDE_DIRS=/opt/LAStools/LASzip/dll/ -DLASZIP_LIBRARY=/usr/local/lib/liblaszip.so .. && \
    make && cp -r /opt/PotreeConverter/resources /opt/PotreeConverter/build/resources

WORKDIR /app

RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=backend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

# Build the project and its dependencies
COPY --from=builder /opt/PotreeConverter/build ./potree
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN yarn turbo run build --filter=backend

FROM base AS runner
WORKDIR /app

# Install dependencies to run PotreeConverter
RUN apt-get install -y \
    libtbb-dev

COPY --from=installer /app .
ENV NODE_ENV=production
ENV LD_LIBRARY_PATH=/usr/local/lib:/app/potree

CMD node ./apps/backend/dist/_app.js
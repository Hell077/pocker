FROM debian:bullseye

# Обновляем и устанавливаем зависимости быстро
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    wget unzip curl postgresql postgresql-contrib gnupg2 nodejs npm && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ========== 2. Установка Temporal Server ==========
RUN useradd -ms /bin/bash temporal

WORKDIR /home/temporal

ENV TEMPORAL_VERSION=1.22.3

RUN wget https://github.com/temporalio/temporal/releases/download/v${TEMPORAL_VERSION}/temporal-${TEMPORAL_VERSION}-linux-amd64.tar.gz && \
    tar -xvzf temporal-${TEMPORAL_VERSION}-linux-amd64.tar.gz && \
    rm temporal-${TEMPORAL_VERSION}-linux-amd64.tar.gz && \
    mv temporal /usr/local/bin/temporal && \
    chmod +x /usr/local/bin/temporal

# ========== 3. Установка Temporal UI ==========
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt install -y nodejs && \
    npm install -g temporalio/ui

# ========== 4. Конфигурация PostgreSQL ==========
USER postgres

RUN service postgresql start && \
    psql --command "CREATE USER temporal WITH SUPERUSER PASSWORD 'temporalpass';" && \
    createdb -O temporal temporal

USER temporal
WORKDIR /home/temporal

# ========== 5. Стартовый скрипт ==========
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]

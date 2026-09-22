import {Kafka} from "kafkajs"

export const kafka = new Kafka({
    clientId : "url-shortener",
    brokers : [process.env.KAFKA_BROKER!],
});
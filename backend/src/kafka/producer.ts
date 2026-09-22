import {kafka} from "./client.js"

class KafkaProducer{
    private producer = kafka.producer();

    async connect(){
        await this.producer.connect();
    }

    async send(topic : string, message : any){
        await this.producer.send({
            topic,
            messages : [
                {
                    key : message.urlId,
                    value : JSON.stringify(message)
                }
            ]
        })
    }
}

export const kafkaProducer = new KafkaProducer()
export interface LinkVisitedEventV1{
    eventId : string,
    eventType : "link.visited",
    eventVersion : 1,
    occuredAt : string,
    shortCode : string,
    urlId : string,
    visitorId? : null,
    ip : string,
    userAgent : string,
    referrer? : string, 
}
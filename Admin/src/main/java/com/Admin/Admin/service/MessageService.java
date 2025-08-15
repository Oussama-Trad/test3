package com.Admin.Admin.service;

import com.mongodb.client.*;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import static com.mongodb.client.model.Accumulators.first;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MessageService {
    private final MongoClient mongoClient;
    private final MongoDatabase database;
    private final MongoCollection<Document> messages;

    public MessageService() {
        // TODO: Remplacer par ta propre URI MongoDB
    String uri = "mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/";
    mongoClient = MongoClients.create(uri);
    database = mongoClient.getDatabase("DBLEONI");
    messages = database.getCollection("messages");
    }

    public List<Document> getConversationsForAdmin(String adminId, String location, String departement, boolean isSuperAdmin) {
        // Agrégation pour regrouper par employé et récupérer le dernier message
        List<Bson> pipeline = new ArrayList<>();
        pipeline.add(Aggregates.match(Filters.or(
            Filters.eq("receiver_id", adminId),
            Filters.eq("sender_id", adminId)
        )));
        pipeline.add(Aggregates.sort(Sorts.descending("timestamp")));
        pipeline.add(Aggregates.group("$sender_id",
            first("lastMessage", "$content"),
            first("lastDate", "$timestamp")
        ));
        return messages.aggregate(pipeline).into(new ArrayList<>());
    }

    public List<Document> getMessagesWithEmployee(String adminId, String employeeId) {
    Bson filter = Filters.or(
        Filters.and(Filters.eq("sender_id", adminId), Filters.eq("receiver_id", employeeId)),
        Filters.and(Filters.eq("sender_id", employeeId), Filters.eq("receiver_id", adminId))
    );
    return messages.find(filter).sort(Sorts.ascending("timestamp")).into(new ArrayList<>());
    }

    public void sendMessage(String senderId, String receiverId, String message) {
    Document doc = new Document()
        .append("sender_id", senderId)
        .append("receiver_id", receiverId)
        .append("content", message)
        .append("timestamp", new Date());
    messages.insertOne(doc);
    }
}

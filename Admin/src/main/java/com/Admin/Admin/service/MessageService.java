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
    private final MongoCollection<Document> conversations;

    public MessageService() {
        // TODO: Remplacer par ta propre URI MongoDB
    String uri = "mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/";
    mongoClient = MongoClients.create(uri);
    database = mongoClient.getDatabase("DBLEONI");
    messages = database.getCollection("messages");
        conversations = database.getCollection("conversations");
    }

    public List<Document> getConversationsForAdmin(String adminId, String location, String departement, boolean isSuperAdmin) {
        // On lit la collection conversations où l'admin est participant
        List<Document> result = new ArrayList<>();
        FindIterable<Document> convs = conversations.find(Filters.in("participants", adminId)).sort(Sorts.descending("updatedAt"));
        for (Document conv : convs) {
            // On cherche l'autre participant (l'employé)
            List<String> participants = (List<String>) conv.get("participants");
            String employeeId = null;
            for (String pid : participants) {
                if (!pid.equals(adminId)) {
                    employeeId = pid;
                    break;
                }
            }
            if (employeeId == null) continue;
            Document doc = new Document();
            doc.put("_id", employeeId);
            doc.put("lastMessage", conv.get("lastMessage") != null ? ((Document)conv.get("lastMessage")).getString("content") : "");
            doc.put("lastDate", conv.get("lastMessage") != null ? ((Document)conv.get("lastMessage")).get("timestamp") : null);
            // Ajout du snapshot si présent
            if (conv.containsKey("employeeSnapshot")) {
                doc.put("employeeSnapshot", conv.get("employeeSnapshot"));
            }
            result.add(doc);
        }
        return result;
    }

    public List<Document> getMessagesWithEmployee(String adminId, String employeeId) {
        // Récupère tous les messages entre admin et employé, peu importe l'ordre des participants
        Bson filter = Filters.or(
            Filters.and(Filters.eq("sender_id", adminId), Filters.eq("receiver_id", employeeId)),
            Filters.and(Filters.eq("sender_id", employeeId), Filters.eq("receiver_id", adminId))
        );
        return messages.find(filter).sort(Sorts.ascending("timestamp")).into(new ArrayList<>());
    }

    public void sendMessage(String senderId, String receiverId, String message) {
        Date now = new Date();
        Document doc = new Document()
            .append("sender_id", senderId)
            .append("receiver_id", receiverId)
            .append("content", message)
            .append("timestamp", now);
        messages.insertOne(doc);

        // --- GESTION CONVERSATIONS ---
        List<String> participants = Arrays.asList(senderId, receiverId);
        Collections.sort(participants);
        Document convQuery = new Document("participants", participants);
        Document lastMessage = new Document()
            .append("sender_id", senderId)
            .append("content", message)
            .append("timestamp", now);
        Document update = new Document("$set", new Document()
            .append("lastMessage", lastMessage)
            .append("updatedAt", now)
        );
        Document existing = conversations.find(convQuery).first();
        if (existing != null) {
            conversations.updateOne(convQuery, update);
        } else {
            Document convDoc = new Document()
                .append("participants", participants)
                .append("lastMessage", lastMessage)
                .append("createdAt", now)
                .append("updatedAt", now);
            conversations.insertOne(convDoc);
        }
    }
}

package com.Admin.Admin.service;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MessageService {

	@Autowired
	private MongoTemplate mongoTemplate;

	public List<Document> getConversationsForAdmin(String adminId, String location, String departement, boolean isSuperAdmin) {
		if (adminId == null) return Collections.emptyList();
		Query query = new Query();
		query.addCriteria(Criteria.where("participants").in(adminId));
		// Optionnel : filtrer par location ou departement si besoin
		return mongoTemplate.find(query, Document.class, "conversations");
	}

	public List<Document> getMessagesWithEmployee(String adminId, String employeeId) {
		if (adminId == null || employeeId == null) return Collections.emptyList();
		Query query = new Query();
		query.addCriteria(new Criteria().orOperator(
			Criteria.where("sender_id").is(adminId).and("receiver_id").is(employeeId),
			Criteria.where("sender_id").is(employeeId).and("receiver_id").is(adminId)
		));
		query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "timestamp"));
		return mongoTemplate.find(query, Document.class, "messages");
	}

	public void sendMessage(String adminId, String employeeId, String content) {
		if (adminId == null || employeeId == null || content == null || content.trim().isEmpty()) {
			return;
		}
		Date now = new Date();
		// 1) Insert the message
		Document msg = new Document();
		msg.put("sender_id", adminId);
		msg.put("receiver_id", employeeId);
		msg.put("content", content.trim());
		msg.put("timestamp", now);
		mongoTemplate.insert(msg, "messages");

		// 2) Upsert or update conversation snapshot
		// We consider one conversation per pair (adminId, employeeId)
		Query convQuery = new Query();
		convQuery.addCriteria(Criteria.where("participants").all(Arrays.asList(adminId, employeeId)));
		Document existing = mongoTemplate.findOne(convQuery, Document.class, "conversations");
		if (existing == null) {
			Document conv = new Document();
			conv.put("participants", Arrays.asList(adminId, employeeId));
			conv.put("_id", employeeId); // keep employeeId as stable key for admin-side listing
			conv.put("lastMessage", content.trim());
			conv.put("lastDate", now);
			mongoTemplate.insert(conv, "conversations");
		} else {
			existing.put("lastMessage", content.trim());
			existing.put("lastDate", now);
			mongoTemplate.save(existing, "conversations");
		}
	}
}

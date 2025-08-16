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
		// TODO: Implémenter la logique réelle d'envoi de message
	}
}

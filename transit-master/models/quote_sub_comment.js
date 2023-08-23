/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('quote_sub_comment', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		quote_comment_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		post_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		senderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		receiverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		sub_type: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		quote_comment: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		createdAt: {
			field:"created_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			field:"updated_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'quote_sub_comment'
	});
};
